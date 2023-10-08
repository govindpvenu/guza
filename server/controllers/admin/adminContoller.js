const User = require("../../models/User")
const Product = require("../../models/Product")
const Order = require("../../models/Order")
const moment = require("moment")

//GET
//@route /admin/
const dashboard = async (req, res) => {
    res.render("admin/dashboard", {
        title: "Dashboard",
        productCount: res.locals.productCount,
        orderCount: res.locals.orderCount,
        userCount: res.locals.userCount,
        totalRevenue: res.locals.totalRevenue,
        layout: "layouts/adminLayout",
    })
}

//GET
//@route /admin/sales-report
const salesReport = async (req, res) => {
    //PAGINATION
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 7
    const skip = (page - 1) * limit
    console.log(limit)
    //REPORT
    const reportOrder = req.query.report
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (reportOrder === "Daily") {
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        var filter = {
            $gte: today,
            $lt: tomorrow,
        }
    } else if (reportOrder === "Monthly") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
        )
        endOfMonth.setHours(23, 59, 59, 999)
        var filter = {
            $gte: startOfMonth,
            $lt: endOfMonth,
        }
    } else if (reportOrder === "Yearly") {
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        const endOfYear = new Date(today.getFullYear() + 1, 0, 1)
        endOfYear.setHours(0, 0, 0, 0)
        var filter = {
            $gte: startOfYear,
            $lt: endOfYear,
        }
    }

    const count = await Order.find({ createdAt: filter }).count()
    const order = await Order.find({ createdAt: filter })
        .skip(skip)
        .limit(limit)

    res.render("admin/sales-report", {
        order,
        count,
        page,
        reportOrder,
        title: "Sales report",
        layout: "layouts/adminLayout",
    })
}

const monthlyreport = async (req, res) => {
    try {
        const start = moment().subtract(30, "days").startOf("day")
        const end = moment().endOf("day")

        const orderSuccessDetails = await Order.find({
            createdAt: { $gte: start, $lte: end },
        })

        const monthlySales = {}
        orderSuccessDetails.forEach((order) => {
            const monthName = moment(order.createdAt).format("MMMM")
            if (!monthlySales[monthName]) {
                monthlySales[monthName] = {
                    revenue: 0,
                    productCount: 0,
                    orderCount: 0,
                    codCount: 0,
                    razorpayCount: 0,
                }
            }
            monthlySales[monthName].revenue += order.totalAmount
            monthlySales[monthName].productCount += orderSuccessDetails.length
            monthlySales[monthName].orderCount++
            if (order.paymentDetails === "COD")
                monthlySales[monthName].codCount++
            else if (order.paymentDetails === "razorpay")
                monthlySales[monthName].razorpayCount++
        })
        const monthlyData = {
            labels: [],
            revenueData: [],
            productCountData: [],
            orderCountData: [],
            codCountData: [],
            razorpayCountData: [],
        }

        for (const monthName in monthlySales) {
            if (monthlySales.hasOwnProperty(monthName)) {
                monthlyData.labels.push(monthName)
                monthlyData.revenueData.push(monthlySales[monthName].revenue)
                monthlyData.productCountData.push(
                    monthlySales[monthName].productCount,
                )
                monthlyData.orderCountData.push(
                    monthlySales[monthName].orderCount,
                )
                monthlyData.codCountData.push(monthlySales[monthName].codCount)
                monthlyData.razorpayCountData.push(
                    monthlySales[monthName].razorpayCount,
                )
            }
        }
        return res.json(monthlyData)
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "An error occurred while generating the monthly report.",
        })
    }
}

module.exports = {
    dashboard,
    salesReport,
    monthlyreport,
}
