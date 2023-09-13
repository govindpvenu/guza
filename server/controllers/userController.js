const asyncHandler = require('express-async-handler')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendEmail, generateOTP } = require("../utils/email");


//GET
//@route /
const homePage = asyncHandler(async (req, res) => {
        const allProducts = await Product.find({$and:[{is_Listed:true},{"category.is_Listed":true}]})
        res.render('user/home', { layout: "layouts/userLayout", allProducts })
})

//GET
//@route /product/:id
const productDetails = asyncHandler(async (req, res) => {
        const product = await Product.findOne({ _id: req.params.id })
        res.render('user/product-details', { layout: "layouts/userLayout", product })
})

//GET
//@route /signup
const signupPage = asyncHandler(async (req, res) => {
    // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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
    signupPage,
    loginPage,
    registerUser,
    loginUser,
    logout,
    verifyOtp,
    validateOtp,

    homePage,
    productDetails
}



