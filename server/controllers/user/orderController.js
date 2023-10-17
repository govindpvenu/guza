const asyncHandler = require("express-async-handler")
const Razorpay = require("razorpay")

const User = require("../../models/User")
const Product = require("../../models/Product")
const Order = require("../../models/Order")
const Coupon = require("../../models/Coupon")

const { generateOrderRazorpay, verifyOrderPayment } = require("../../helper/razorPay")
const { products } = require("../admin/productController")

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
            if (order.paymentDetails === "COD") {
                console.log("COD")
                //Decrease product quantity
                for (const cartItem of user.cart) {
                    var product = await Product.findById(cartItem.productId)
                    if (product) {
                        product.quantity -= cartItem.quantity
                        await product.save()
                    }
                }
                // Set stock status
                if (product.quantity < 1) {
                    product.stock_status = "Not Available"
                    await product.save()
                }
                // Make the cart empty
                await User.updateOne({ _id: userId }, { $unset: { cart: 1 } })

                //change status
                await Order.updateOne({ _id: orderId }, { $set: { paymentStatus: "PENDING", orderStatus: "PLACED" } }).lean()

                res.status(200).send({ status: "COD", orderId: orderId })
            } else if (req.body.payment_option === "razorpay") {
                console.log("razorpay")
                const total = req.body.total
                const generatedOrder = await generateOrderRazorpay(orderId, total)
                // Send Razorpay response to the client
                res.status(200).send({
                    status: "razorpay",
                    success: true,
                    msg: "Order created",
                    order_id: generatedOrder.id,
                    amount: generatedOrder.amount,
                    reciept: orderId,
                    key_id: process.env.RAZORPAY_KEY_ID,
                    contact: "7994652840",
                    name: "admin",
                    email: "admin@gmail.com",
                })
            } else if (req.body.payment_option === "wallet") {
                console.log("wallet")
                //Decrease product quantity
                for (const cartItem of user.cart) {
                    var product = await Product.findById(cartItem.productId)
                    if (product) {
                        product.quantity -= cartItem.quantity
                        await product.save()
                    }
                }
                // Set stock status
                if (product.quantity < 1) {
                    product.stock_status = "Not Available"
                    await product.save()
                }
                // Make the cart empty
                await User.updateOne({ _id: userId }, { $unset: { cart: 1 } })

                const orderAmount = req.body.total * -1
                console.log({ orderAmount })
                await User.findByIdAndUpdate(res.locals.user._id, { $inc: { wallet: orderAmount } })

                //change status
                await Order.updateOne({ _id: orderId }, { $set: { paymentStatus: "RECEIVED", orderStatus: "PLACED" } }).lean()

                res.status(200).send({ status: "wallet", orderId: orderId })
            } else {
                console.error("Razorpay order creation failed:", err)
                res.status(400).send({
                    success: false,
                    msg: "Something went wrong!",
                })
            }
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
}

//POST
//@route/verify-payment
const verifyPayment = async (req, res) => {
    try {
        verifyOrderPayment(req.body)
            .then(async () => {
                const userId = res.locals.user._id
                const orderId = req.body.orderId
                const user = await User.findById(userId)

                console.log("Payment SUCCESSFUL")

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

                //change status
                await Order.updateOne({ _id: req.body.orderId }, { $set: { paymentStatus: "RECEIVED", orderStatus: "PLACED" } }).lean()

                res.status(200).json({ status: "success", orderId:orderId,msg: "Payment verified" })
            })
            .catch((err) => {
                console.log(err)
                res.json({ status: false, errMsg: "Payment failed!" })
            })
    } catch (err) {
        console.log("3g")
        res.status(400).json({
            status: "error",
            msg: "Payment verification failed",
        })
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
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: "CANCELLED" })
    const orderAmount = order.totalAmount

    for (const product of order.products) {
        await Product.findByIdAndUpdate(product.productId, { $inc: { quantity: product.quantity } });
    }
    console.log({ orderAmount })
    const user = await User.findByIdAndUpdate(res.locals.user._id, { $inc: { wallet: orderAmount } })
    res.redirect("/account/orders")
})

const applyCoupon = async (req, res) => {
    try {
        const { GrandTotal, couponCode } = req.body;
        const currentDate = new Date();
        const coupon = await Coupon.findOne({ couponCode });

        //Checking wether the coupon is expired and eligible for the order
        if (!coupon || coupon.minPrice > GrandTotal || currentDate < coupon.startDate || currentDate > coupon.endDate) {
            return res.json({ status: false });
        }

        //Adding the coupon claimed user in to an array
        await Coupon.findByIdAndUpdate({ _id: coupon._id }, { $push: { user: res.locals.user._id } })
        
        const finalAmount = parseInt(GrandTotal) - parseInt(coupon.discount);
        return res.json({ status: true, GrandTotal: finalAmount, offer: coupon.discount });
    } catch (error) {
        console.error("Error in applying coupon:", error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};


module.exports = {
    placeOrder,
    orderDetails,
    cancelOrder,
    verifyPayment,
    applyCoupon
}
