const asyncHandler = require('express-async-handler')
const User = require('../../models/User');


//GET
//@route /admin/customers
const customers = asyncHandler(async (req, res) => {

    //PAGINATION
    const page= req.query.page*1 || 1;
    const limit = req.query.limit*1 || 7;
    const skip = (page -1) * limit;
    const count = await User.find({}).count()

    const allCustomers = await User.find({}).skip(skip).limit(limit)
    const messages = await req.consumeFlash('info')
    res.render('admin/customers', {layout: "layouts/adminLayout",messages, allCustomers,page,count})
})

//GET
//@route /admin/customers/block/:id
const blockUser = asyncHandler(async (req, res) => {
    let userId = req.params.id;
    res.clearCookie('user_access');
    let user = await User.findByIdAndUpdate({ _id: userId }, { isBlocked: true })
    await req.flash('info', 'User blocked');
    res.redirect('/admin/customers')
})

//GET
//@route /admin/customers/unblock/:id
const unblockUser = asyncHandler(async (req, res) => {
    let userId = req.params.id;
    let user = await User.findByIdAndUpdate({ _id: userId }, { isBlocked: false })
    await req.flash('info', 'User unblocked');
    res.redirect('/admin/customers')
})

module.exports = {
    customers,
    blockUser,
    unblockUser
}