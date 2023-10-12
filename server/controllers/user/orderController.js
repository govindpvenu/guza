const asyncHandler = require("express-async-handler")
const Razorpay = require("razorpay")

const User = require("../../models/User")
const Product = require("../../models/Product")
const Order = require("../../models/Order")

const { generateOrderRazorpay, verifyOrderPayment } = require("../../helper/razorPay")

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

                res.status(200).send({ status: "COD" })
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

                res.status(200).send({ status: "COD" })
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

                res.status(200).json({ status: "success", msg: "Payment verified" })
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
    console.log({ orderAmount })
    const user = await User.findByIdAndUpdate(res.locals.user._id, { $inc: { wallet: orderAmount } })
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
