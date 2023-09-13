const asyncHandler = require('express-async-handler')
const Product = require("../models/Product");
const Category = require("../models/Category");

//GET
//@route /admin/products
const products = asyncHandler(async (req, res) => {
    const messages = await req.consumeFlash('info')
    const allProducts= await Product.find({$and:[{is_Listed:true},{"category.is_Listed":true}]})
    res.render('admin/products',{layout: "layouts/adminLayout",messages, allProducts})
})

//GET
//@route /admin/products/add-product
const addProduct = asyncHandler(async (req, res) => {
    const allCategories= await Category.find({})
    res.render('admin/add-product',{layout: "layouts/adminLayout", allCategories})
})

//POST
//@route /admin/product/post-product
const postProduct = asyncHandler(async (req, res) => {
    const { title, description, brand, price, category,regular_price,sales_price,quantity } = req.body;
    const category_id= await Category.findOne({name:category},{})

    const images = req.files;
    const imageFilenames = [];

    for (const image of images) {
      const filename = image.filename
      imageFilenames.push(filename);
    }
    const product = await Product.create({
      title,
      description,
      brand,
      price,
      regular_price,
      sales_price,
      quantity,
      category:category_id,
      images:imageFilenames
    });
  await req.flash('info', 'Product added successfully');
  res.redirect('/admin/products')
});

//GET
//@route /admin/product/edit/:id
const editProduct = asyncHandler(async(req,res)=>{
    let product_id = req.params.id;
    let product = await Product.findOne({ _id: product_id });
    const allCategories= await Category.find({})
    console.log(product);
    res.render('admin/edit-product',{layout: "layouts/adminLayout",product, allCategories})
})

//post
//@route /admin/product/edit/:id
const updateProduct = asyncHandler(async(req,res)=>{
    console.log(req.body);

    let product_id = req.params.id;
    const { title, description, brand, category,regular_price,sales_price,quantity } = req.body;
    const category_id= await Category.findOne({name:category},{})
    const images = req.files;
    if (images.length) {
        const imageFilenames = [];
        for (const image of images) {
          const filename = image.filename
          imageFilenames.push(filename);
        }
        const product = await Product.findOneAndUpdate({ _id: product_id },{images:imageFilenames});
    }
    const product = await Product.findOneAndUpdate({ _id: product_id },{title,description,brand,regular_price,sales_price,quantity,category:category_id,});
    await req.flash('info', 'Product edited successfully');
    res.redirect('/admin/products')
})

//GET
//@route /admin/product/delete/:id
const deleteProduct = asyncHandler(async(req,res)=>{
    let product_id = req.params.id;
    let product = await Product.findByIdAndUpdate({ _id: product_id },{is_Listed:false});
    await req.flash('info', 'Product has been deleted');
    res.redirect('/admin/products')
})

module.exports = {
    products,
    addProduct,
    postProduct,
    editProduct,
    updateProduct,
    deleteProduct,
}