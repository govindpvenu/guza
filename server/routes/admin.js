const express = require("express")
const router = express.Router()
const upload = require("../utils/multer")
//Controllers
const { dashboard, salesReport, monthlyreport } = require("../controllers/admin/adminContoller")
const { adminLogin, adminVerify, adminLogout } = require("../controllers/admin/authController")
const { products, addProduct, postProduct, deleteProduct, editProduct, updateProduct, deleteImage } = require("../controllers/admin/productController")
const { editCategory, updateCategory, deleteCategory, categories, addCategory, postCategory } = require("../controllers/admin/categoryController")
const { editBanner, updateBanner, deleteBanner, banner, addBanner, postBanner } = require("../controllers/admin/bannerController")

const { customers, blockUser, unblockUser } = require("../controllers/admin/customerController")
const { orders, adminCancelOrder, changeStatus } = require("../controllers/admin/orderController")
const { coupon, addCoupon, postCoupon, editCoupon, updateCoupon, deleteCoupon } = require("../controllers/admin/couponController")

//Middlewares
const { isAdmin, isAdminAuth } = require("../middleware/adminAuth")
const { resizeImages } = require("../utils/sharp")
const { getProductCount, getUserCount, getOrderCount, getTotalRevenue, recentOrders, recentProducts, newUsers } = require("../helper/retrieveData")

//--------Routes--------
//Admin Auth
router.route("/").get(isAdmin, getProductCount, getUserCount, getOrderCount, getTotalRevenue, recentOrders, recentProducts, newUsers, dashboard)
router.route("/monthly-report").get(monthlyreport)
router.route("/login").get(isAdminAuth, adminLogin).post(adminVerify)
router.route("/logout").get(adminLogout)

//Product Management
router.route("/products").get(isAdmin, products)
router.route("/products/add-product").get(isAdmin, addProduct)
router.route("/products/post-product").post(isAdmin, upload.array("image"), resizeImages, postProduct)
router.route("/products/delete/:id").get(isAdmin, deleteProduct)
router.route("/products/edit/:id").get(isAdmin, editProduct).post(isAdmin, upload.array("image"), resizeImages, updateProduct)
router.route("/delete-image/:id/:img").get(isAdmin, deleteImage)

//Category Management
router.route("/categories").get(isAdmin, categories)
router.route("/categories/add-category").get(isAdmin, addCategory)
router.route("/categories/post-category").post(isAdmin, upload.single("image"), postCategory)
router.route("/categories/edit/:id").get(isAdmin, editCategory).post(isAdmin, upload.single("image"), updateCategory)
router.route("/categories/delete/:id").get(isAdmin, deleteCategory)

//User Management
router.route("/customers").get(isAdmin, customers)
router.route("/customers/block/:id").get(blockUser)
router.route("/customers/unblock/:id").get(unblockUser)

//Order Management
router.route("/orders").get(isAdmin, orders)
router.route("/admin-order-cancel/:id").get(isAdmin, adminCancelOrder)
router.route("/change-status/:id").get(isAdmin, changeStatus)

//Banner Management
router.route("/banner").get(isAdmin, banner)
router.route("/banner/add-banner").get(isAdmin, addBanner).post(isAdmin, upload.single("image"), postBanner)
router.route("/banner/edit/:id").get(isAdmin, editBanner).post(isAdmin, upload.single("image"), updateBanner)
router.route("/banner/delete/:id").get(isAdmin, deleteBanner)


//Sales Report
router.route("/sales-report").get(isAdmin, salesReport)

//Coupon
router.route("/coupon").get(isAdmin, coupon)
router.route("/coupon/add-coupon").get(isAdmin, addCoupon).post(isAdmin, postCoupon)
router.route("/coupon/edit-coupon/:id").get(isAdmin, editCoupon).post(isAdmin, updateCoupon)
router.route("/coupon/delete/:id").get(isAdmin, deleteCoupon)





module.exports = router
