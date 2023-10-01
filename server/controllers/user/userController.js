const asyncHandler = require('express-async-handler')
const Product = require('../../models/Product');
const Category = require("../../models/Category");


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
        const randomProducts = await Product.aggregate([{ $match: { $and: [ { stock_status: "Available" }, { is_Listed: true }, { "category.is_Listed": true } ] } },  { $sample: { size: 8 } }])
        const product = await Product.findOne({ _id: req.params.id })
        console.log(randomProducts);
        res.render('user/product-details', { layout: "layouts/userLayout", product ,randomProducts})
})

//GET
//@route /shop/
const shopPage = asyncHandler(async (req, res) => {
    //PAGINATION
    const page= req.query.page*1 || 1;
    const limit = 9;
    const skip = (page-1) * limit;
    const count = await Product.find({$and:[{stock_status:"Available"},{is_Listed:true},{"category.is_Listed":true}]}).count()

    const allProducts= await Product.find({$and:[{stock_status:"Available"},{is_Listed:true},{"category.is_Listed":true}]}).skip(skip).limit(limit)
    const allCategories= await Category.find({})
    const brands = await Product.aggregate([ { $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] } }, { $group: { _id: "$brand", products: { $push: "$$ROOT" }, productCount: { $sum: 1 } } }, { $project: { _id: 0, brand: "$_id", productCount: 1 } } ])
    const product_type = await Product.aggregate([ { $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] } }, { $group: { _id: "$product_type", products: { $push: "$$ROOT" }, productCount: { $sum: 1 } } }, { $project: { _id: 0, product_type: "$_id", productCount: 1 } } ])
    res.render('user/shop', { layout: "layouts/userLayout", allProducts,allCategories,brands,product_type,count,page,limit })
})





module.exports = {
    homePage,
    productDetails,
    shopPage,

}



