const asyncHandler = require("express-async-handler")
const User = require("../../models/User")

//GET
//@route /admin/customers
const customers = asyncHandler(async (req, res) => {
    //Search
    const search = req.query.search || ""

    //SORT
    var sort = req.query.sort || "createdAt"
    var order = req.query.order || 1

    const sortMethod = {}
    sortMethod[sort] = order

    //PAGINATION
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 7
    const skip = (page - 1) * limit
    const count = await User.find({}).count()

    const allCustomers = await User.find({
        name: { $regex: search, $options: "i" },
    })
        .sort(sortMethod)
        .skip(skip)
        .limit(limit)
    const messages = await req.consumeFlash("info")
    res.render("admin/customers", {
        layout: "layouts/adminLayout",
        title: "Users",
        messages,
        allCustomers,
        page,
        count,
        sort,
        order,
    })
})

//GET
//@route /admin/customers/block/:id
const blockUser = asyncHandler(async (req, res) => {
    let userId = req.params.id
    res.clearCookie("user_access")
    let user = await User.findByIdAndUpdate({ _id: userId }, { isBlocked: true })
    await req.flash("info", "User blocked")
    res.redirect("/admin/customers")
})

//GET
//@route /admin/customers/unblock/:id
const unblockUser = asyncHandler(async (req, res) => {
    let userId = req.params.id
    let user = await User.findByIdAndUpdate({ _id: userId }, { isBlocked: false })
    await req.flash("info", "User unblocked")
    res.redirect("/admin/customers")
})

module.exports = {
    customers,
    blockUser,
    unblockUser,
}
