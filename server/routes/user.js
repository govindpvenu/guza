const express = require('express');
const router = express.Router();
const { homePage, signupPage ,loginPage, registerUser ,loginUser,logout,verifyOtp,validateOtp,productDetails,shopPage,accountDetails,updateUser,userDashboard,addAddress,editAddress,manageAddress,orders,postAddress,getCart,getCheckout,updateAddress, deleteAddress} = require('../controllers/userController')
const {protectedRoute,notProtectedRoute,isUserAuth} = require("../middleware/userAuth");

const { check, validationResult } = require('express-validator')
const validator = require('../middleware/express-validator');



router.route('/').get(notProtectedRoute,homePage)
router.route('/shop').get(notProtectedRoute,shopPage)
router.route('/product/:id').get(notProtectedRoute,productDetails)

router.route('/account').get(protectedRoute,userDashboard)
router.route('/account/account-details').get(protectedRoute,accountDetails)
router.route('/account/editUser').post(protectedRoute,validator.userValidation,updateUser)
router.route('/account/add-address').get(protectedRoute,addAddress).post(protectedRoute,validator.addressValidator,postAddress)
router.route('/account/edit-address/:id').get(protectedRoute,editAddress).post(protectedRoute,validator.addressValidator,updateAddress)
router.route('/account/delete-address/:id').get(protectedRoute,deleteAddress)
router.route('/account/manage-address').get(protectedRoute,manageAddress)
router.route('/account/orders').get(protectedRoute,orders)

router.route('/cart').get(protectedRoute,getCart)
router.route('/checkout').get(protectedRoute,getCheckout)



router.route('/signup').get(isUserAuth,signupPage).post(registerUser)
router.route('/login').get(isUserAuth,loginPage).post(loginUser)
router.route('/logout').get(logout)
router.route('/verify').get(isUserAuth,verifyOtp).post(validateOtp)


module.exports = router
 