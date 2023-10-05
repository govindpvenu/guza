const User = require("../../models/User")
const Product = require("../../models/Product")
const Order = require("../../models/Order")

//GET
//@route /admin/
const dashboard = async(req, res) => {
    res.render("admin/dashboard", {
        title:"Dashboard",
        productCount: res.locals.productCount,
        orderCount: res.locals.orderCount,
        userCount: res.locals.userCount,
        totalRevenue: res.locals.totalRevenue,
        layout: "layouts/adminLayout"})
}

//GET
//@route /admin/sales-report
const salesReport = async(req, res) => {
    const reportOrder = req.query.report

    if(reportOrder === "daily"){
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1)

        var filter = {
              $gte: today,
              $lt: tomorrow
            }
    }
    else if(reportOrder === "monthly"){
        const today = new Date();
        today.setHours(0, 0, 0, 0)

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999); 

        var filter = {
              $gte: startOfMonth,
              $lt: endOfMonth
            }
    }
    else if(reportOrder === "yearly"){
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        const endOfYear = new Date(today.getFullYear() + 1, 0, 1)
        endOfYear.setHours(0, 0, 0, 0)
        var filter = {
              $gte: startOfYear,
              $lt: endOfYear
            }
    }


    const order =  await Order.find({createdAt:filter})
    res.render("admin/sales-report", {
        order,
        reportOrder,
        title:"Sales report",
        layout: "layouts/adminLayout" })
}

module.exports = {
    dashboard,
    salesReport
}

