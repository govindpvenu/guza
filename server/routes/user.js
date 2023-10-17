const express = require("express")
const router = express.Router()

//Controllers
const { homePage, productDetails, shopPage, wishlistPage, addToWishList, deleteWishlistItem, contactPage, aboutPage } = require("../controllers/user/userController")
const { accountDetails, updateUser, addAddress, editAddress, manageAddress, orders, postAddress, updateAddress, deleteAddress, wallet, addToWallet, verifyWalletPayment, referrals } = require("../controllers/user/accountController")
const { signupPage, loginPage, registerUser, loginUser, logout, verifyOtp, validateOtp } = require("../controllers/user/authController")
const { cartPage, checkoutPage, addToCart, changeQuantity, deleteCartItem } = require("../controllers/user/cartController")
const { placeOrder, orderDetails, cancelOrder, verifyPayment, applyCoupon } = require("../controllers/user/orderController")

//Middlewares
const { protectedRoute, notProtectedRoute, isUserAuth } = require("../middleware/userAuth")
const validator = require("../utils/express-validator")

//--------Routes-------

//Auth
router.route("/signup").get(isUserAuth, signupPage).post(registerUser)
router.route("/login").get(isUserAuth, loginPage).post(loginUser)
router.route("/logout").get(logout)
router.route("/verify").get(isUserAuth, verifyOtp).post(validateOtp)

//User
router.route("/").get(notProtectedRoute, homePage)
router.route("/shop").get(notProtectedRoute, shopPage)
router.route("/product/:id").get(notProtectedRoute, productDetails)
router.route("/contact").get(notProtectedRoute, contactPage)
router.route("/about").get(notProtectedRoute, aboutPage)

//Wishlist
router.route("/wishlist").get(protectedRoute, wishlistPage)
router.route("/add-to-wishlist").post(protectedRoute, addToWishList)
router.route("/remove-wishlist/:id").get(protectedRoute, deleteWishlistItem)

//Cart
router.route("/cart").get(protectedRoute, cartPage)
router.route("/add-to-cart").post(protectedRoute, addToCart)
router.route("/change-quantity").post(protectedRoute, changeQuantity)
router.route("/remove-cart/:id").get(protectedRoute, deleteCartItem)
router.route("/checkout").get(protectedRoute, checkoutPage)

//Order
router.route("/place-order").post(protectedRoute, placeOrder)
router.route("/order-details/:id").get(protectedRoute, orderDetails)
router.route("/order-cancel/:id").get(protectedRoute, cancelOrder)
router.route("/verify-payment").post(protectedRoute, verifyPayment)
router.route("/apply-coupon").post(protectedRoute, applyCoupon)

//Account
router.route("/account/").get(protectedRoute, accountDetails)
router.route("/account/edit-user").post(protectedRoute, validator.userValidation, updateUser)
router.route("/account/add-address").get(protectedRoute, addAddress).post(protectedRoute, validator.addressValidator, postAddress)
router.route("/account/edit-address/:id").get(protectedRoute, editAddress).post(protectedRoute, validator.addressValidator, updateAddress)
router.route("/account/delete-address/:id").get(protectedRoute, deleteAddress)
router.route("/account/manage-address").get(protectedRoute, manageAddress)
router.route("/account/orders").get(protectedRoute, orders)
router.route("/account/wallet").get(protectedRoute, wallet)
router.route("/add-to-wallet").post(protectedRoute, addToWallet)
router.route("/verify-wallet-payment").post(protectedRoute, verifyWalletPayment)
router.route("/account/referrals").get(protectedRoute, referrals)

module.exports = router
