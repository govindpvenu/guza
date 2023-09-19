const asyncHandler = require('express-async-handler')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator')
const User = require('../../models/User');
const Product = require('../../models/Product');
const Category = require("../../models/Category");
const { sendEmail, generateOTP } = require("../../utils/nodemailer");
const { default: mongoose } = require('mongoose');


//GET
//@route/
const homePage = asyncHandler(async (req, res) => {
        const allProducts = await Product.find({$and:[{stock_status:"Available"},{is_Listed:true},{"category.is_Listed":true}]})

        const brands = await Product.aggregate([ { $match: { $and: [{stock_status:"Available"},{ is_Listed: true }, { "category.is_Listed": true }] } }, { $group: { _id: "$brand", products: { $push: "$$ROOT" }, firstImage: { $first: { $arrayElemAt: ["$images", 0] } }, productCount: { $sum: 1 } } }, { $project: { _id: 0, brand: "$_id", firstImage: 1, productCount: 1 } } ])
        const product_type = await Product.aggregate([ { $match: { $and: [{stock_status:"Available"},{ is_Listed: true }, { "category.is_Listed": true }] } }, { $group: { _id: "$product_type", products: { $push: "$$ROOT" }, firstImage: { $first: { $arrayElemAt: ["$images", 0] } }, productCount: { $sum: 1 } } }, { $project: { _id: 0, product_type: "$_id", firstImage: 1, productCount: 1 } } ])
        
        res.render('user/home', { layout: "layouts/userLayout", allProducts ,brands,product_type})
})

//GET
//@route /product/:id
const productDetails = asyncHandler(async (req, res) => {
        const product = await Product.findOne({ _id: req.params.id })
        res.render('user/product-details', { layout: "layouts/userLayout", product })
})

//GET
//@route /shop/
const shopPage = asyncHandler(async (req, res) => {
    const allProducts = await Product.find({$and:[{stock_status:"Available"},{is_Listed:true},{"category.is_Listed":true}]})
    const allCategories= await Category.find({})
    const brands = await Product.aggregate([ { $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] } }, { $group: { _id: "$brand", products: { $push: "$$ROOT" }, productCount: { $sum: 1 } } }, { $project: { _id: 0, brand: "$_id", productCount: 1 } } ])
    const product_type = await Product.aggregate([ { $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] } }, { $group: { _id: "$product_type", products: { $push: "$$ROOT" }, productCount: { $sum: 1 } } }, { $project: { _id: 0, product_type: "$_id", productCount: 1 } } ])
    res.render('user/shop', { layout: "layouts/userLayout", allProducts,allCategories,brands,product_type })
})

//GET
//@route /account/
const userDashboard = asyncHandler(async (req, res) => {
    const user = res.locals.user
    res.render('user/account', { layout: "layouts/userLayout" ,user})
})


//GET
//@route /account/account-details
const accountDetails = asyncHandler(async (req, res) => {
    const user = res.locals.user
    const messages = await req.consumeFlash('success')
    res.render('user/account-details', { layout: "layouts/userLayout" ,user,messages})
})

//POST
//@route /account/account-details
const updateUser = asyncHandler(async(req, res) => {
    const user = res.locals.user
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const alert = errors.array()
        const messages = await req.consumeFlash('success')
        res.render('user/account-details',{ layout: "layouts/userLayout" ,alert,messages})
    }else{
        const { name, email, phone, password,npassword } = req.body
        const userUpdate = await User.findOneAndUpdate({ _id: user._id },{ name, email, phone,});
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
        res.render('user/account-add-address',{ layout: "layouts/userLayout" ,alert,messages})
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
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const alert = errors.array()
        res.render('user/account-edit-address',{ layout: "layouts/userLayout" ,alert})
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
    res.render('user/account-orders', { layout: "layouts/userLayout" ,user})
})






































//GET
//@route /signup
const signupPage = asyncHandler(async (req, res) => {
        emailErr = false, phoneErr = false
        res.render('user/signup', { layout: "layouts/authLayout", emailErr, phoneErr })
})

//POST
// @route /signup
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body
    const emailExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone });
    if (emailExists) {
        emailErr = true, phoneErr = false
        res.render('user/signup', { layout: "layouts/authLayout", emailErr, phoneErr })
    } else if (phoneExists) {
        phoneErr = true, emailErr = false
        res.render('user/signup', { layout: "layouts/authLayout", phoneErr, emailErr })
    }
    else {
        try {
            req.session.userData = { name, email, phone, password }
            const generatedOTP = generateOTP()
            req.session.generatedOTP = generatedOTP
            console.log(generatedOTP);

            await sendEmail(email, generatedOTP)

            res.redirect('/verify')
        } catch (error) {
            console.log(error);
        }
    }
});

//GET
//@route /verify
const verifyOtp = asyncHandler(async (req, res) => {
    // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('user/otp', { layout: "layouts/authLayout" });
})

//POST
//@route /verify
const validateOtp = asyncHandler(async (req, res) => {
    const number = ""
    const { n, u, m, b, e, r } = req.body
    const enteredOTP = Number(number.concat(n, u, m, b, e, r))
    const { name, email, phone, password } = req.session.userData

    if (enteredOTP === req.session.generatedOTP) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword
        })
        const payload = {
            user: {
              _id: user._id,
            },
          };
        let adminToken = jwt.sign( payload , process.env.jwtSecretKey, { expiresIn: '1d' })
        res.cookie('user_access', adminToken, { httpOnly: true })
        res.redirect('/')
    } else {
        res.render('user/otp', { layout: "layouts/authLayout" });
    }
})

//GET
//@route /login
const loginPage = asyncHandler(async (req, res) => {
        emailErr = false, passErr = false, blockErr = false
        res.render('user/login', { layout: "layouts/authLayout", passErr, emailErr, blockErr })
})

//POST 
// @route /login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email });
    if (user) {
        if (user.isBlocked) {
            passErr = false, emailErr = false, blockErr = true
            res.render('user/login', { layout: "layouts/authLayout", blockErr })
        } else {
            if (await bcrypt.compare(password, user.password)) {
                const payload = {
                    user: {
                      _id: user._id,
                    },
                  };
                let adminToken = jwt.sign( payload , process.env.jwtSecretKey, { expiresIn: '1d' })
                res.cookie('user_access', adminToken, { httpOnly: true })
                res.redirect('/')
            } else {
                passErr = true, emailErr = false, blockErr = false
                res.render('user/login', { layout: "layouts/authLayout", passErr })
            }
        }
    } else {
        emailErr = true, passErr = false, blockErr = false
        res.render('user/login', { layout: "layouts/authLayout", emailErr })
    }
})

//GET
//@route /logout
const logout = asyncHandler(async (req, res) => {
    res.clearCookie('user_access');
    res.redirect('/login')
})





module.exports = {
    homePage,
    productDetails,
    shopPage,
    userDashboard,
    accountDetails,
    updateUser,
    addAddress,
    postAddress,
    editAddress,
    manageAddress,
    orders,
    updateAddress,
    deleteAddress,




    signupPage,
    loginPage,
    registerUser,
    loginUser,
    logout,
    verifyOtp,
    validateOtp
}



