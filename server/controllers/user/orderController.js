const asyncHandler = require("express-async-handler")
const Razorpay = require("razorpay")


const User = require("../../models/User")
const Product = require("../../models/Product")
const Order = require("../../models/Order")

const {
    generateOrderRazorpay,
    verifyOrderPayment,
} = require("../../helper/razorpay")
const { error, log } = require("console")

var razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})


exports.placeOrderrrrrrr = async (req, res, next) => {
    try {
        const {
            addressId,
            paymentMethod,
            totalAmount,
            discountAmount,
            discountCoupon,
        } = req.body
        if (addressId && paymentMethod) {
            const userId = req.session.user._id
            const cartProducts = res.locals.userCart.products
            console.log("CART PRODUCTS LIST : " + cartProducts)
            console.log(JSON.stringify(cartProducts))

            const address = res.locals.addresses.filter((item) => {
                return item._id.equals(addressId)
            })
            const orderId = String(new Date().getTime()).slice(-6)

            const products = await Cartdb.aggregate([
                { $match: { customerId: new mongoose.Types.ObjectId(userId) } },
                { $unwind: "$products" },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "productInfo",
                    },
                },
                {
                    $project: {
                        productInfo: 1,
                        quantity: "$products.quantity",
                        _id: 0,
                        salePrice: "$productInfo.salePrice",
                        productName: "$productInfo.productName",
                        category: "$productInfo.category",
                        productImage: "$productInfo.images[0]",
                    },
                },
            ])

            if (products.length === 0) {
                console.log(" No items in cart!!")
            } else {
                products.forEach((product) => {
                    const prodCategoryName = res.locals.categories.filter(
                        (cat) => cat._id.equals(product?.category[0]),
                    )
                    console.log(JSON.stringify(prodCategoryName))
                    product.category[0] = prodCategoryName[0]?.categoryName
                })
            }

            console.log("CART products ::::::")
            console.log(JSON.stringify(products))
            const totalItems = cartProducts.reduce((tot, product) => {
                return product.quantity + tot
            }, 0)

            const updateOperations = []
            let isAvailable = true
            let i = 0
            for (const item of products) {
                if (item.quantity > item.productInfo[0].stock) {
                    isAvailable = false
                    console.log("1")
                    break
                }
                console.log("2")
                updateOperations.push({
                    updateOne: {
                        filter: { _id: item.productInfo[0]._id.toString() },
                        update: { $inc: { stock: -item.quantity } },
                    },
                })
                cartProducts[i].productName = item.productName[0]
                cartProducts[i].category = item.category[0]
                cartProducts[i].salePrice = item.salePrice[0]
                cartProducts[i].productImage = item.productImage[0]
                i++
            }

            if (!isAvailable)
                return res
                    .status(400)
                    .json({
                        status: false,
                        errMsg: "Some items are out of stock",
                    })

            const result = await Productdb.bulkWrite(updateOperations)
            if (result.modifiedCount !== products.length) {
                return res
                    .status(500)
                    .json({
                        status: false,
                        errMsg: "Something went wrong, Pls try again later",
                    })
            }
            const tempOrder = {
                orderId: orderId,
                customerId: userId,
                paymentMethod: paymentMethod,
                products: cartProducts,
                shippingAddress: address[0],
                totalAmount: totalAmount,
                totalItems: totalItems,
                finalAmount: totalAmount,
            }
            if (discountCoupon !== "") {
                tempOrder.coupon = discountCoupon
                tempOrder.discount = discountAmount
                tempOrder.totalAmount =
                    Number(totalAmount) + Number(discountAmount)
            }
            const newOrder = new Orderdb(tempOrder)

            newOrder
                .save()
                .then(async (savedOrder) => {
                    console.log(savedOrder._id)
                    console.log(savedOrder)
                    if (Number(savedOrder.finalAmount) < 1)
                        return res.json({
                            status: false,
                            errMsg: "Minimum amount should be ₹1",
                        })
                    if (savedOrder.paymentMethod === "COD") {
                        console.log("COD: " + savedOrder.paymentMethod)
                        await Cartdb.findOneAndDelete({
                            customerId: req.session.user._id,
                        })
                            .then(async () => {
                                res.json({ payment: true })
                                console.log(
                                    "Cleared user cart after order is placed!",
                                )
                            })
                            .catch((err) => {
                                res.status(500).render("error", {
                                    message:
                                        "Unable to clear user cart after order is placed!",
                                    errStatus: 500,
                                })
                                console.log(err)
                            })
                    } else if (savedOrder.paymentMethod === "RAZORPAY") {
                        const generatedOrder = await generateOrderRazorpay(
                            savedOrder._id,
                            savedOrder.finalAmount,
                        )
                        res.json({
                            payment: false,
                            method: "razorpay",
                            razorpayOrder: generatedOrder,
                            order: savedOrder,
                        })
                    } else if (savedOrder.paymentMethod === "WALLET") {
                        console.log("WALLET: " + savedOrder.paymentMethod)
                        const walletBalance = await getUserWalletBalance(
                            req.session.user._id,
                        )
                        if (walletBalance < savedOrder.finalAmount) {
                            console.log("Wallet is short of money!")
                            res.json({
                                payment: false,
                                method: "wallet",
                                errMsg: "Insufficent balance in wallet to process the order!",
                            })
                        } else {
                            console.log("WALLET: " + savedOrder.paymentMethod)
                            await addWalletTransactionToDb(
                                req.session.user._id,
                                savedOrder.finalAmount * 100,
                                "D",
                                "Debited for order",
                            )
                            const paymentDetails = {
                                walletBalance: await getUserWalletBalance(
                                    req.session.user._id,
                                ),
                            }
                            exports
                                .changePaymentStatus(
                                    savedOrder._id,
                                    paymentDetails,
                                    "PAID",
                                )
                                .then(async () => {
                                    res.json({ status: true, method: "wallet" })
                                    await Cartdb.findOneAndDelete({
                                        customerId: req.session.user._id,
                                    })
                                })
                        }
                    }
                })
                .catch((err) => {
                    res.status(500).render("error", {
                        message: "Unable to place order",
                        errStatus: 500,
                    })
                    console.log(err)
                })
        } else {
            res.status(500).render("error", {
                message: "Unable to place order",
                errStatus: 500,
            })
            console.log("Unable to place order")
        }
    } catch (err) {
        res.status(500).render("error", {
            message: "Unable to place order",
            errStatus: 500,
        })
        console.log(err)
    }
}

//POST
//@route/place-order
const placeOrder = async (req, res) => {
    try {

        const userId = res.locals.user._id
        const user = await User.findById(userId)
        const address = user.address.find(
            (address) => address._id.toString() === req.body.address,
        )

        const order = new Order({
            customerId: userId,
            quantity: req.body.quantity,
            price: req.body.salePrice,
            products: user.cart,
            totalAmount: req.body.total,
            shippingAddress: address,
            paymentDetails: req.body.payment_option,
        })

        const orderSuccess = await order.save()
        const orderId = order._id;

        if (orderSuccess) {
            //Decrease product quantity
            for (const cartItem of user.cart) {
                var product = await Product.findById(cartItem.productId)
                if (product) {
                    product.quantity -= cartItem.quantity
                    await product.save()
                }
            }
            // set stock status
            if (product.quantity < 1) {
                product.stock_status = "Not Available"
                await product.save()
            }
            // Make the cart empty
            await User.updateOne({ _id: userId }, { $unset: { cart: 1 } })

            if (order.paymentDetails === "COD") {
                console.log('COD');
                // res.render('user/success-page');
                // res.redirect("/success-page")
                res.status(200).send({status: 'COD',})
            }else if (req.body.payment_option === "razorpay") {
                console.log('razorpay');
                const amount = req.body.total * 100; // Amount in paise
                const options = {
                  amount: amount,
                  currency: "INR",
                  receipt: orderId,
                };
        
                // Create a Razorpay order
                razorpay.orders.create(options,(err, order) => {
                  if (!err) {
                    console.log("Razorpay order created");
                    console.log(orderId);
        
                    // Send Razorpay response to the client
                    res.status(200).send({
                      status:"razorpay",
                      success: true,
                      msg: "Order created",
                      order_id: order.id,
                      amount: amount,
                      reciept: orderId,
                      key_id:  process.env.RAZORPAY_KEY_ID,
                      contact: "7994652840",
                      name: "admin",
                      email: "admin@gmail.com",
                    });
                  } else {
                    console.error("Razorpay order creation failed:", err);
                    res.status(400).send({ success: false, msg: "Something went wrong!" });
                  }
                });
              }
              else{
                console.log(error);
              }
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error");
    }
}



//veerify payment

const verifyPayment = async(req, res) => {
    try {
      console.log('this is id:',req.body.orderId);
      console.log('body:');
      console.log(req.body);
      console.log('this is id1:',req.body['payment[razorpay_payment_id]']);
      const razorpay_order_id = req.body['payment[razorpay_order_id]']
      const razorpay_payment_id = req.body['payment[razorpay_payment_id]']
      const razorpay_signature = req.body['payment[razorpay_signature]']
      console.log('this is id2:',req.body.payment);
    //   const kk = await Order.find({_id : new mongoose.Types.ObjectId(req.body.orderId)}).lean()
    //   if(kk)
    //     console.log(kk);
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      hmac = hmac.digest('hex');
        
      console.log(hmac);
      console.log(razorpay_signature);
      if (hmac == razorpay_signature) {
        console.log('call comes here');
        console.log(typeof(req.body.orderId));
        await Order.updateOne({_id :req.body.orderId},{$set : { paymentStatus : 'RECEIVED', orderStatus :"SUCCESS"}}).lean()

        res.status(200).json({ status: 'success', msg: 'Payment verified' });
      } else {
        console.log('um b');
        res.status(400).json({ status: 'error', msg: 'Payment verification failed' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', msg: 'Internal server error' });
    }
  };

exports.verifyRazorpayPayment = (req, res) => {
    try {
        verifyOrderPayment(req.body)
            .then(async () => {
                console.log("Payment SUCCESSFUL")
                exports
                    .changePaymentStatus(
                        req.body.order._id,
                        req.body.payment,
                        "PAID",
                    )
                    .then(() => {
                        res.json({ status: true })
                    })
                await Cartdb.findOneAndDelete({
                    customerId: req.session.user._id,
                })
            })
            .catch((err) => {
                console.log(err)
                res.json({ status: false, errMsg: "Payment failed!" })
            })
    } catch (err) {
        console.log(err)
        res.json({ status: false, errMsg: "Payment failed!" })
    }
}

// exports.changePaymentStatus = (orderId, payment, status) => {
//     const editOrder = {
//         _id: orderId,
//         paymentStatus: status,
//         paymentDetails: payment,
//     }
//     return new Promise((resolve, reject) => {
//         Orderdb.findByIdAndUpdate(orderId, editOrder)
//             .then(() => {
//                 resolve()
//             })
//             .catch((err) => {
//                 reject(err)
//             })
//     })
// }

//GET
//@route//order-details/:id
const orderDetails = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id }).populate(
        "products.productId",
    )
    res.render("user/order-details", {
        layout: "layouts/userLayout",
        order: order,
    })
})

//GET
//@route/order-cancel/:id
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        orderStatus: "CANCELLED",
    })
    res.redirect("/account/orders")
})

//GET
//@route/order-cancel/:id
const successPage = asyncHandler(async (req, res) => {
    res.render("user/success-page")
})

module.exports = {
    placeOrder,
    orderDetails,
    cancelOrder,
    successPage,
    verifyPayment,
}
