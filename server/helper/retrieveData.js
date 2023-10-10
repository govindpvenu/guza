const User = require("../models/User")
const Product = require("../models/Product")
const Order = require("../models/Order")
module.exports = {
    getProductCount: async (req, res, next) => {
        try {
            console.log("Getting Product Count------------>")
            const count = await Product.countDocuments({
                $and: [{ is_Listed: true }, { "category.is_Listed": true }],
            })

            if (count) {
                console.log("Product Count ::::::::::::::::::" + count)
                res.locals.productCount = count
                console.log(res.locals.productCount)
            }
            next()
        } catch (err) {
            console.log(err)
            next()
        }
    },

    getUserCount: async (req, res, next) => {
        try {
            console.log("Getting User Count------------>")
            const count = await User.countDocuments({})

            if (count) {
                console.log("User Count ::::::::::::::::::" + count)
                res.locals.userCount = count
                console.log(res.locals.userCount)
            }
            next()
        } catch (err) {
            console.log(err)
            next()
        }
    },
    getOrderCount: async (req, res, next) => {
        try {
            console.log("Getting Order Count------------>")
            const count = await Order.countDocuments({})
            if (count || count === 0) {
                console.log("Order Count ::::::::::::::::::" + count)
                res.locals.orderCount = count
                console.log(res.locals.orderCount)
            }
            next()
        } catch (err) {
            console.log(err)
            next()
        }
    },
    getTotalRevenue: async (req, res, next) => {
        try {
            console.log("Getting TotalRevenue------------>")
            const totalRevenueAggregate = await Order.aggregate([
                {
                    $match: {
                        discount: 0,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmountSum: { $sum: "$totalAmount" },
                    },
                },
            ])
            const totalRevenue = totalRevenueAggregate.length > 0 ? totalRevenueAggregate[0].totalAmountSum : 0
            if (totalRevenue || totalRevenue === 0) {
                console.log("TotalRevenue ::::::::::::::::::" + totalRevenue)
                res.locals.totalRevenue = totalRevenue
                console.log(res.locals.totalRevenue)
            }
            next()
        } catch (err) {
            console.log(err)
            next()
        }
    },
    recentOrders: async (req, res, next) => {
        try {
            console.log("Getting recentOrders------------>")
            const recentOrders = await Order.find({}).populate("products.productId").sort({ createdAt: -1 }).limit(3)
            if (recentOrders) {
                console.log("recentOrders ::::::::::::::::::" + recentOrders.length)
                res.locals.recentOrders = recentOrders
                console.log(res.locals.recentOrders)
            }
            next()
        } catch (err) {
            console.log(err)
            next()
        }
    },
    recentProducts: async (req, res, next) => {
        try {
            console.log("Getting recentProducts------------>")
            const recentProducts = await Product.find({
                $and: [{ is_Listed: true }, { "category.is_Listed": true }],
            })
                .sort({ createdAt: -1 })
                .limit(3)
            if (recentProducts) {
                console.log("recentProducts ::::::::::::::::::" + recentProducts.length)
                res.locals.recentProducts = recentProducts
                console.log(res.locals.recentProducts)
            }
            next()
        } catch (err) {
            console.log(err)
            next()
        }
    },
    newUsers: async (req, res, next) => {
        try {
            console.log("Getting newUsers------------>")
            const newUsers = await User.find({}).sort({ createdAt: -1 }).limit(4)
            if (newUsers) {
                console.log("newUsers ::::::::::::::::::" + newUsers.length)
                res.locals.newUsers = newUsers
                console.log(res.locals.newUsers)
            }
            next()
        } catch (err) {
            console.log(err)
            next()
        }
    },
}
