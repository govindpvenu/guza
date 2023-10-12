const asyncHandler = require("express-async-handler")
const Product = require("../../models/Product")
const Category = require("../../models/Category")
const Order = require("../../models/Order")
const User = require("../../models/User")

//GET
//@route/
const homePage = asyncHandler(async (req, res) => {
    const messages = await req.consumeFlash("success")

    const allProducts = await Product.find({
        $and: [{ stock_status: "Available" }, { is_Listed: true }, { "category.is_Listed": true }],
    })

    const brands = await Product.aggregate([
        {
            $match: {
                $and: [{ stock_status: "Available" }, { is_Listed: true }, { "category.is_Listed": true }],
            },
        },
        {
            $group: {
                _id: "$brand",
                products: { $push: "$$ROOT" },
                firstImage: { $first: { $arrayElemAt: ["$images", 0] } },
                productCount: { $sum: 1 },
            },
        },
        { $project: { _id: 0, brand: "$_id", firstImage: 1, productCount: 1 } },
    ])

    const product_type = await Product.aggregate([
        {
            $match: {
                $and: [{ stock_status: "Available" }, { is_Listed: true }, { "category.is_Listed": true }],
            },
        },
        {
            $group: {
                _id: "$product_type",
                products: { $push: "$$ROOT" },
                firstImage: { $first: { $arrayElemAt: ["$images", 0] } },
                productCount: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                product_type: "$_id",
                firstImage: 1,
                productCount: 1,
            },
        },
    ])

    res.render("user/home", {
        layout: "layouts/userLayout",
        allProducts,
        brands,
        product_type,
        messages,
    })
})

//GET
//@route /product/:id
const productDetails = asyncHandler(async (req, res) => {
    const userLoggined = res.locals.user
    var productId = req.params.id
    console.log(userLoggined)
    if (userLoggined) {
        const user = await User.findById(res.locals.user._id)
        var itemExists = user.wishlist.find((item) => item.productId.equals(productId))
        console.log(itemExists)
    }
    const randomProducts = await Product.aggregate([
        {
            $match: {
                $and: [{ stock_status: "Available" }, { is_Listed: true }, { "category.is_Listed": true }],
            },
        },
        { $sample: { size: 8 } },
    ])

    const product = await Product.findOne({ _id: productId })

    res.render("user/product-details", {
        layout: "layouts/userLayout",
        product,
        randomProducts,
        itemExists,
    })
})

//GET
//@route /shop/
const shopPage = asyncHandler(async (req, res) => {
    //Sort
    var sort = req.query.sort || "stock_status"
    var order = req.query.order || 1

    const sortMethod = {}
    sortMethod[sort] = order
    //Filter
    const type = req.query.type
    const brand = req.query.brand
    const category = req.query.category
    const size = req.query.size
    var filter = [{ stock_status: "Available" }, { is_Listed: true }, { "category.is_Listed": true }]
    type && filter.push({ product_type: type })
    brand && filter.push({ brand: brand })
    category && filter.push({ "category.name": category })
    size && filter.push({ size: size })
    //Search
    const search = req.query.search
    search && filter.push({ title: { $regex: search, $options: "i" } })

    //PAGINATION
    const page = req.query.page * 1 || 1
    const limit = 9
    const skip = (page - 1) * limit
    const count = await Product.find({ $and: filter }).count()

    const allProducts = await Product.find({ $and: filter }).sort(sortMethod).skip(skip).limit(limit)
    const allCategories = await Category.find({})
    const brands = await Product.aggregate([
        {
            $match: {
                $and: [{ is_Listed: true }, { "category.is_Listed": true }],
            },
        },
        {
            $group: {
                _id: "$brand",
                products: { $push: "$$ROOT" },
                productCount: { $sum: 1 },
            },
        },
        { $project: { _id: 0, brand: "$_id", productCount: 1 } },
    ]).sort({ brand: 1 })
    const product_type = await Product.aggregate([
        {
            $match: {
                $and: [{ is_Listed: true }, { "category.is_Listed": true }],
            },
        },
        {
            $group: {
                _id: "$product_type",
                products: { $push: "$$ROOT" },
                productCount: { $sum: 1 },
            },
        },
        { $project: { _id: 0, product_type: "$_id", productCount: 1 } },
    ]).sort({ product_type: 1 })
    res.render("user/shop", {
        layout: "layouts/userLayout",
        allProducts,
        allCategories,
        brands,
        product_type,
        count,
        page,
        limit,
        type,
        brand,
        category,
        size,
        sort,
        order,
        search,
    })
})

//POST
//@route /add-to-wishlist
const addToWishList = async (req, res) => {
    try {
        const userId = res.locals.user._id
        const productId = req.body.productId
        const user = await User.findById(userId)

        console.log("adding to wishlist")

        const existingItem = user.wishlist.find((item) => item.productId.equals(productId))
        if (existingItem) {
            user.wishlist.splice(user.wishlist.indexOf(existingItem.item), 1)
            await user.save()
            res.status(200).send({ itemExists: true })
        } else {
            user.wishlist.push({ productId })
            await user.save()
            res.status(200).send({ itemExists: false })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//POST
//@route /remove-wishlist
const deleteWishlistItem = async (req, res) => {
    try {
        const userId = res.locals.user._id
        const productIdToDelete = req.params.id
        const user = await User.findById(userId)
        console.log(productIdToDelete)
        console.log(user.wishlist.length)
        user.wishlist = user.wishlist.filter((item) => !item.productId.equals(productIdToDelete))

        await user.save()
        res.redirect("/wishlist")
    } catch (error) {
        console.log(error.message)
    }
}

//GET
//@route /wishlist/
const wishlistPage = asyncHandler(async (req, res) => {
    const randomProducts = await Product.aggregate([
        {
            $match: {
                $and: [{ stock_status: "Available" }, { is_Listed: true }, { "category.is_Listed": true }],
            },
        },
        { $sample: { size: 8 } },
    ])

    const user = await User.findOne({
        _id: res.locals.user._id,
    }).populate("wishlist.productId")

    const wishlist = user.wishlist
    console.log(wishlist[0])

    res.render("user/wishlist", {
        layout: "layouts/userLayout",
        randomProducts,
        wishlist,
    })
})

//GET
//@route /contact/
const contactPage = asyncHandler(async (req, res) => {
    res.render("user/contact", {
        layout: "layouts/userLayout",
    })
})

//GET
//@route /about/
const aboutPage = asyncHandler(async (req, res) => {
    res.render("user/about", {
        layout: "layouts/userLayout",
    })
})

module.exports = {
    homePage,
    productDetails,
    shopPage,
    wishlistPage,
    aboutPage,
    contactPage,
    addToWishList,
    deleteWishlistItem,
}
