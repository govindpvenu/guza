const asyncHandler = require("express-async-handler")
const Order = require("../../models/Order")
const User = require("../../models/User")
const { ObjectId } = require("mongodb")

//GET
//@route /orders/
const orders = asyncHandler(async (req, res) => {
    //FILTER
    var filter = [{}]
    const paymentMethod = req.query.paymentMethod

    switch (paymentMethod) {
        case "Razorpay":
            filter.push({ paymentDetails: "razorpay" })
            break
        case "COD":
            filter.push({ paymentDetails: "COD" })
            break
        case "Wallet":
            filter.push({ paymentDetails: "wallet" })
            break
        default:
            break
    }

    //PAGINATION
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 7
    const skip = (page - 1) * limit
    const count = await Order.find({ $and: filter }).populate("products.productId").count()

    const allOrders = await Order.find({ $and: filter }).populate("products.productId").skip(skip).limit(limit)
    res.render("admin/orders", {
        layout: "layouts/adminLayout",
        title: "Order Management",
        orders,
        allOrders,
        count,
        page,
        paymentMethod,
    })
})

//GET
//@route /admin-order-cancel/:id
const adminCancelOrder = async (req, res) => {
    try {
        const id = req.params.id
        const order = await Order.findByIdAndUpdate(id, { orderStatus: "CANCELLED" })
        const orderAmount = order.totalAmount
        const userId = order.customerId
        const user = await User.findByIdAndUpdate(userId, { $inc: { wallet: orderAmount } })

        res.redirect("/admin/orders")
    } catch (error) {
        console.error(error.message)
    }
}

//GET
//@route /change-status/:id
const changeStatus = async (req, res) => {
    try {
        const id = req.params.id
        const order = await Order.findOne({ _id: id })
        switch (order.orderStatus) {
            case "PENDING":
                update = { orderStatus: "PLACED" }
                break

            case "PLACED":
                update = { orderStatus: "SHIPPED" }
                break

            case "SHIPPED":
                update = { orderStatus: "OUT OF DELIVERY" }
                break

            case "OUT OF DELIVERY":
                update = { orderStatus: "DELIVERED" }
                break

            case "DELIVERED":
                update = { orderStatus: "PENDING" }
                break

            case "CANCELLED":
                update = { orderStatus: "PENDING" }
                break

            default:
                update = { orderStatus: "PENDING" }
                break
        }
        const orderUpdate = await Order.findByIdAndUpdate(id, update)
        res.redirect("/admin/orders")
    } catch (error) {
        console.error(error.message)
    }
}

module.exports = {
    orders,
    adminCancelOrder,
    changeStatus,
}
