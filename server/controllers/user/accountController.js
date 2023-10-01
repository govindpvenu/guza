const asyncHandler = require('express-async-handler')
const bcrypt = require("bcrypt")
const { check, validationResult } = require('express-validator')
const User = require('../../models/User');
const Order = require("../../models/Order");
const { default: mongoose } = require('mongoose');

//GET
//@route /account/
const userDashboard = asyncHandler(async (req, res) => {
    const user = res.locals.user
    res.render('user/account-dashboard', { layout: "layouts/userLayout" ,user})
})


//GET
//@route /account/account-details
const accountDetails = asyncHandler(async (req, res) => {
    const user = res.locals.user
    const messages = await req.consumeFlash('success')
    res.render('user/account-details', { layout: "layouts/userLayout" ,user,messages})
})

//POST
//@route /account/edit-user
const updateUser = asyncHandler(async(req, res) => {
    const user = res.locals.user
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const alert = errors.array()
        const messages = await req.consumeFlash('success')
        res.render('user/account-details',{ layout: "layouts/userLayout" ,alert,user,messages})
    }else{
        const { name, email, phone, password,npassword } = req.body
        const userUpdate = await User.findOneAndUpdate({ _id: user._id },{ name, email, phone,});
        console.log(changePassword);
        if (changePassword) {
            const hashedPassword = await bcrypt.hash(npassword, 10);
            const userUpdate = await User.findOneAndUpdate({ _id: user._id },{ password:hashedPassword});
        }
        await req.flash('success', 'Account details edited successfully');
        res.redirect('/account/account-details')
        }
})


//GET
//@route /account/add-address
const addAddress = asyncHandler(async (req, res) => {
    const user = res.locals.user
    const messages = await req.consumeFlash('success')
    res.render('user/account-add-address', { layout: "layouts/userLayout" ,user,messages})
})

//POST
//@route /account/add-address
const postAddress = asyncHandler(async (req, res) => {
    const user = res.locals.user
    console.log(req.body);
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const alert = errors.array()
        const messages = await req.consumeFlash('success')
        res.render('user/account-add-address',{ layout: "layouts/userLayout" ,alert,user,messages})
    }else{
        await User.findByIdAndUpdate({_id:user.id},{
        $push:{
            address:{
                _id:new mongoose.Types.ObjectId(),
                name: req.body.name,
                mobile: req.body.mobile,
                state: req.body.state,
                district: req.body.district,
                city: req.body.city,
                pin: req.body.pin,
                address: req.body.address
            }
        }
    })
    await req.flash('success', 'Address added successfully');
    res.redirect('/account/add-address')
}
})

//GET
//@route /account/manage-address
const manageAddress = asyncHandler(async (req, res) => {
    const user = res.locals.user
    const messages = await req.consumeFlash('success')
    res.render('user/account-manage-address', { layout: "layouts/userLayout" ,user,messages})
})

//GET
//@route /account/edit-address
const editAddress = asyncHandler(async (req, res) => {
    const user = res.locals.user
    const address_id = req.params.id

    const userData = await User.findOne({_id:user._id})
    const address = userData.address.find(a => a._id.toString() === address_id);
    res.render('user/account-edit-address', { layout: "layouts/userLayout" ,user,address})
})

//POST
//@route /account/edit-address
const updateAddress = asyncHandler(async (req, res) => {
    const user = res.locals.user
    const address_id = req.params.id
    const userData = await User.findOne({_id:user._id})
    const address = userData.address.find(a => a._id.toString() === address_id);
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const alert = errors.array()
        res.render('user/account-edit-address',{ layout: "layouts/userLayout" ,alert,address})
    }else{
        await User.findOneAndUpdate({ _id: user.id, 'address._id': address_id },
            {
              $set: {
                'address.$.name': req.body.name,
                'address.$.mobile': req.body.mobile,
                'address.$.state': req.body.state,
                'address.$.district': req.body.district,
                'address.$.city': req.body.city,
                'address.$.pin': req.body.pin,
                'address.$.address': req.body.address,
              },
            }
    )
    await req.flash('success', 'Address updated successfully');
    res.redirect('/account/manage-address')
}
})


//POST
//@route /account/delete-address
const deleteAddress = asyncHandler(async(req,res)=>{
    const user = res.locals.user
    let address_id = req.params.id;
    await User.findOneAndUpdate(
        { _id: user.id },
        {
          $pull: {
            address: { _id: address_id },
          },
        }
      );
      await req.flash('success', 'Address deleted successfully');
      res.redirect('/account/manage-address')
})


//GET
//@route /account/orders
const orders = asyncHandler(async (req, res) => {
    const user = res.locals.user
    const page= req.query.page*1 || 1;
    const limit = req.query.limit*1 || 15;
    const skip = (page -1) * limit;
    const count = await Order.find({ customerId: user._id }).count()

    const orders = await Order.find({ customerId: user._id }).skip(skip).limit(limit);
    
    res.render('user/account-orders', { layout: "layouts/userLayout" ,user,orders,count,page})
})


module.exports = {
    userDashboard,
    accountDetails,
    updateUser,

    addAddress,
    postAddress,
    
    manageAddress,

    editAddress,
    updateAddress,
    
    deleteAddress,
    
    orders,
}