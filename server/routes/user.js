const express = require('express');
const router = express.Router();
const { homePage, signupPage ,loginPage, registerUser ,loginUser,logout,verifyOtp,validateOtp,productDetails} = require('../controllers/userController')
const {protectedRoute,notProtectedRoute,isUserAuth} = require("../middleware/userAuth");

// router.use(Auth.checkUser);


router.route('/').get(notProtectedRoute,homePage)
router.route('/signup').get(isUserAuth,signupPage).post(registerUser)
router.route('/login').get(isUserAuth,loginPage).post(loginUser)
router.route('/logout').get(logout)
router.route('/verify').get(isUserAuth,verifyOtp).post(validateOtp)
router.route('/product/:id').get(notProtectedRoute,productDetails)


module.exports = router
 