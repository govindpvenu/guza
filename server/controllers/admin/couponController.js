const asyncHandler = require("express-async-handler")
const User = require("../../models/User")

//GET
//@route /admin/coupon
const coupon = asyncHandler(async (req, res) => {
    const a = 32
    console.count(a);
    res.render("admin/coupon", {
        layout: "layouts/adminLayout",
        title: "Coupon Manangement",
    })
})

//GET
//@route /admin/coupon/add-coupon
const addCoupon = asyncHandler(async (req, res) => {
    res.render("admin/add-coupon.ejs", {
        layout: "layouts/adminLayout",
        title: "Create Coupon",
    })
})



module.exports = {
    coupon,
    addCoupon
}
