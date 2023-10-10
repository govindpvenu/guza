const asyncHandler = require("express-async-handler")
const Razorpay = require("razorpay")

const User = require("../../models/User")
const Product = require("../../models/Product")
const Order = require("../../models/Order")

const {
    generateOrderRazorpay,
    verifyOrderPayment,
} = require("../../helper/razorPay")



//POST
//@route/place-order
const placeOrder = async (req, res) => {
    try {
        const userId = res.locals.user._id
        const user = await User.findById(userId)
        const address = user.address.find((address) => address._id.toString() === req.body.address)
        if (!user.cart.length) {
            res.redirect("/cart")
            return
        }
        console.log(user.cart.length)

        const order = new Order({
            customerId: userId,
            price: req.body.salePrice,
            quantity: req.body.quantity,
            products: user.cart,
            totalAmount: req.body.total,
            shippingAddress: address,
            paymentDetails: req.body.payment_option,
        })

        const orderSuccess = await order.save()
        const orderId = order._id

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
                console.log("COD")
                // res.render('user/success-page');
                // res.redirect("/success-page")
                res.status(200).send({ status: "COD" })
            } else if (req.body.payment_option === "razorpay") {
                console.log("razorpay")
                const total = req.body.total
                const generatedOrder = await generateOrderRazorpay(orderId,total );

                // Send Razorpay response to the client
                res.status(200).send({
                    status: "razorpay",
                    success: true,
                    msg: "Order created",
                    order_id: order.id,
                    amount: amount,
                    reciept: orderId,
                    key_id: process.env.RAZORPAY_KEY_ID,
                    contact: "7994652840",
                    name: "admin",
                    email: "admin@gmail.com",
                })

            
                    } else {
                        console.error("Razorpay order creation failed:", err)
                        res.status(400).send({
                            success: false,
                            msg: "Something went wrong!",
                        })
                    }
                })
            } else {
                console.log(error)
            }
        }
    } catch (error) {
        console.error(error.message)
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}

//POST
//@route/verify-payment
const verifyPayment = async (req, res) => {
    try {
        console.log("this is id:", req.body.orderId)
        console.log("body:")
        console.log(req.body)
        console.log("this is id1:", req.body["payment[razorpay_payment_id]"])
        const razorpay_order_id = req.body["payment[razorpay_order_id]"]
        const razorpay_payment_id = req.body["payment[razorpay_payment_id]"]
        const razorpay_signature = req.body["payment[razorpay_signature]"]
        console.log("this is id2:", req.body.payment)
        //   const kk = await Order.find({_id : new mongoose.Types.ObjectId(req.body.orderId)}).lean()
        //   if(kk)
        //     console.log(kk);
        const crypto = require("crypto")
        let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
        hmac = hmac.digest("hex")

        console.log(hmac)
        console.log(razorpay_signature)
        if (hmac == razorpay_signature) {
            console.log("call comes here")
            console.log(typeof req.body.orderId)
            await Order.updateOne({ _id: req.body.orderId }, { $set: { paymentStatus: "RECEIVED", orderStatus: "SUCCESS" } }).lean()

            res.status(200).json({ status: "success", msg: "Payment verified" })
        } else {
            console.log("um b")
            res.status(400).json({
                status: "error",
                msg: "Payment verification failed",
            })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ status: "error", msg: "Internal server error" })
    }
}

//GET
//@route//order-details/:id
const orderDetails = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id }).populate("products.productId")
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
