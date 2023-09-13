const asyncHandler = require('express-async-handler')
const User = require('../models/User');


//GET
//@route /admin/customers
const customers = asyncHandler(async (req, res) => {
    const allCustomers = await User.find({})
    const messages = await req.consumeFlash('info')
    res.render('admin/customers', {layout: "layouts/adminLayout",messages,  allCustomers })
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