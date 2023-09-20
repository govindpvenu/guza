const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig')
//Controllers
const { dashboard,adminLogin,adminVerify,adminLogout,} = require('../controllers/admin/adminController')
const {products,addProduct,postProduct,deleteProduct,editProduct,updateProduct,deleteImage} = require('../controllers/admin/productController')
const {editCategory,updateCategory,deleteCategory,categories,addCategory,postCategory,}= require('../controllers/admin/categoryController')
const {customers,blockUser,unblockUser}= require('../controllers/admin/customerController')
const {orders,adminCancelOrder,changeStatus}= require('../controllers/admin/orderController')

//Middlewares
const {isAdmin,isAdminAuth} = require("../middleware/adminAuth");


router.route('/').get(isAdmin,dashboard)
router.route('/login').get(isAdminAuth,adminLogin).post(adminVerify)
router.route('/logout').get(adminLogout)

router.route('/products').get(isAdmin,products)
router.route('/products/add-product').get(isAdmin,addProduct)
router.route('/products/post-product').post(isAdmin,upload.array('image'),postProduct)
router.route('/products/delete/:id').get(isAdmin,deleteProduct)
router.route('/products/edit/:id').get(isAdmin,editProduct).post(isAdmin,upload.array('image'),updateProduct)
router.route('/delete-image/:id/:img').get(isAdmin,deleteImage)



router.route('/categories').get(isAdmin,categories)
router.route('/categories/add-category').get(isAdmin,addCategory)
router.route('/categories/post-category').post(isAdmin,upload.single('image'),postCategory)
router.route('/categories/edit/:id').get(isAdmin,editCategory).post(isAdmin,upload.single('image'),updateCategory)
router.route('/categories/delete/:id').get(isAdmin,deleteCategory)

router.route('/customers').get(isAdmin,customers)
router.route('/customers/block/:id').get(blockUser)
router.route('/customers/unblock/:id').get(unblockUser)

router.route('/orders').get(isAdmin,orders)
router.route('/admin-order-cancel/:id').get(isAdmin,adminCancelOrder)
router.route('/change-status/:id').get(isAdmin,changeStatus)





module.exports = router