const asyncHandler = require("express-async-handler")
const User = require("../../models/User")
const Coupon = require("../../models/Coupon")

//GET
//@route /admin/coupon
const coupon = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({ isDeleted: false })
    console.log(coupons);
    const messages = await req.consumeFlash("info")
    res.render("admin/coupon", {
        layout: "layouts/adminLayout",
        title: "Coupon Manangement",
        coupons,
        messages,
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


//POST
//@route /admin/coupon/add-coupon
const postCoupon = asyncHandler(async (req, res) => {
    const { title, couponCode, startDate, endDate, discount, minPrice, status, } = req.body

    const coupon = await Coupon.create({
        title,
        couponCode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        discount,
        minPrice,
        status,
    })

    await req.flash("info", "Coupon created successfully")
    res.redirect("/admin/coupon")
})


//GET
//@route /admin/coupon/edit-coupon/:id
const editCoupon = asyncHandler(async (req, res) => {
    let coupon_id = req.params.id
    let coupon = await Coupon.findOne({ _id: coupon_id })

    res.render("admin/edit-coupon.ejs", {
        layout: "layouts/adminLayout",
        title: "Edit Coupon",
        coupon
    })
})


//POST
//@route /admin/coupon/edit-coupon/:id
const updateCoupon = asyncHandler(async (req, res) => {
    let coupon_id = req.params.id
    const { title, couponCode, startDate, endDate, discount, minPrice, status, } = req.body
    const update = {
        title,
        couponCode,
        discount,
        minPrice,
        status,
    }
    if (startDate) {
        update.startDate = new Date(startDate)
    }
    if (endDate) {
        update.endDate = new Date(endDate)
    }
    const coupon = await Coupon.findByIdAndUpdate({ _id: coupon_id }, update)

    await req.flash("info", "Coupon edited successfully")
    res.redirect("/admin/coupon")
})

//GET
//@route /admin/coupon/delete/:id
const deleteCoupon = asyncHandler(async (req, res) => {
    let coupon_id = req.params.id
    let coupon = await Coupon.findByIdAndUpdate({ _id: coupon_id }, { isDeleted: true })
    await req.flash("info", "Coupon deleted")
    res.redirect("/admin/coupon")
})

const applyCoupon =  async (req, res) => {
    console.log(req.body);
    let coupon = await Coupon.findOne({ couponCode: req.body.couponCode })

    if (coupon) {
        let GrandTotal = parseInt(req.body.GrandTotal) - parseInt(coupon.discount)
        console.log(GrandTotal, 'kkkkkkkkkk');
        await Coupon.findByIdAndUpdate({ _id: coupon._id }, { $push: { user: res.locals.user._id} })
        res.json({ status: true, GrandTotal: GrandTotal, offer: coupon.discount })
    } else {
        res.json({ status: false })
    }
}



module.exports = {
    coupon,
    addCoupon,
    postCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon,
    applyCoupon
}
