const asyncHandler = require('express-async-handler')
const Category = require("../models/Category");

//GET
//@route /admin/categories
const categories = asyncHandler(async (req, res) => {
    const allCategories= await Category.find({is_Listed:true})
    const messages = await req.consumeFlash('info')
    res.render('admin/categories',{layout: "layouts/adminLayout",messages, allCategories})
})
//GET
//@route /admin/categories/add-category
const addCategory = asyncHandler(async (req, res) => {
    const messages = await req.consumeFlash('info')
    res.render('admin/add-category',{layout: "layouts/adminLayout",messages} )
})

//POST
//@route /admin/categories/post-category
const postCategory = async (req, res) => {
    const {name} = req.body;
    const image = req.file.filename;
    try {
        const category = await Category.create({
            name,
            image
          });
          await req.flash('info', 'Category added');
          res.redirect('/admin/categories')
    } catch (err) {
            if (err.code === 11000) {
                await req.flash('info', 'Category Already Exists');
                res.redirect('/admin/categories/add-category')
            }
    }

}

//GET
//@route /admin/categories/edit/:id
const editCategory = asyncHandler(async (req, res) => {
    let category_id = req.params.id;
    let category = await Category.findOne({ _id: category_id });
    res.render('admin/edit-category',{layout: "layouts/adminLayout",category} )
})

//POST
//@route /admin/categories/edit/:id
const updateCategory = asyncHandler(async(req,res)=>{
    let category_id = req.params.id;
    const {name} = req.body;
    if (req.file) {
        const image = req.file.filename;
        const category = await Category.findOneAndUpdate({ _id: category_id },{image});
    }
    const category = await Category.findOneAndUpdate({ _id: category_id },{name});
    await req.flash('info', 'Category edited');
    res.redirect('/admin/categories')
})

//GET
//@route /admin/categories/delete/:id
const deleteCategory = asyncHandler(async(req,res)=>{
    let category_id = req.params.id;
    let category = await Category.findByIdAndUpdate({ _id:category_id },{is_Listed:false});
    await req.flash('info', 'Category deleted');
    res.redirect('/admin/categories')
})


module.exports = {
    categories,
    addCategory,
    postCategory,
    editCategory,
    updateCategory,
    deleteCategory,
}