const asyncHandler = require("express-async-handler")
const Order = require("../../models/Order")
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
        const update = {
            orderStatus: "CANCELLED",
        }
        const order = await Order.findByIdAndUpdate(id, update)

        res.redirect("/admin/orders")
    } catch (error) {
        console.log(error.message)
    }
}

//GET
//@route /change-status/:id
const changeStatus = async (req, res) => {
    try {
        const id = req.params.id
        console.log(id)
        const order = await Order.findOne({ _id: id })
        console.log("current status:" + order.orderStatus)
        switch (order.orderStatus) {
            case "SUCCESS":
                console.log("success")
                update = { orderStatus: "CANCELLED" }
                break

            case "PENDING":
                console.log("pending")
                update = { orderStatus: "SUCCESS" }
                break

            case "CANCELLED":
                console.log("cancelled")
                update = { orderStatus: "PENDING" }
                break
            default:
                console.log("default")
                break
        }
        const orderUpdate = await Order.findByIdAndUpdate(id, update)
        res.redirect("/admin/orders")
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    orders,
    adminCancelOrder,
    changeStatus,
}
