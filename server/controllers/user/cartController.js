const asyncHandler = require("express-async-handler")

const User = require("../../models/User")
const Product = require("../../models/Product")

//GET
//@route /cart
const cartPage = async (req, res) => {
    try {
        const userCart = await User.findOne({
            _id: res.locals.user._id,
        }).populate("cart.productId")
        const randomProducts = await Product.aggregate([
            {
                $match: {
                    $and: [
                        { stock_status: "Available" },
                        { is_Listed: true },
                        { "category.is_Listed": true },
                    ],
                },
            },
            { $sample: { size: 8 } },
        ])
        let grandTotal = 0
        for (let i = 0; i < userCart.cart.length; i++) {
            grandTotal =
                grandTotal +
                parseInt(userCart.cart[i].productId.sales_price) *
                    parseInt(userCart.cart[i].quantity)
        }

        res.render("user/cart", {
            layout: "layouts/userLayout",
            userCart: userCart,
            grandTotal: grandTotal,
            randomProducts,
        })
    } catch (error) {
        console.log(error.message)
    }
}

//POST
//@route /add-to-cart
const addToCart = async (req, res) => {
    try {
        const userId = res.locals.user._id
        const productId = req.body.productId
        const quantity = parseInt(req.body.quantity)
        const product = await Product.findById(productId)
        const user = await User.findById(userId)

        const existingItem = user.cart.find((item) =>
            item.productId.equals(productId),
        )
        if (existingItem) {
            existingItem.quantity += quantity
            if (existingItem.quantity > product.quantity) {
                existingItem.quantity = product.quantity
            }
        } else {
            user.cart.push({ productId, quantity })
        }
        await user.save()
        res.redirect("/cart")
    } catch (error) {
        console.log(error.message)
    }
}

//POST
//@route /change-quantity
const changeQuantity = async (req, res) => {
    count = parseInt(req.body.count)
    try {
        await User.updateOne(
            { _id: res.locals.user._id, "cart.productId": req.body.productId },
            { $inc: { "cart.$.quantity": count } },
            { new: true },
        )
        res.json(true)
    } catch (error) {
        console.log(error.message)
    }
}

//POST
//@route /remove-cart/:id
const deleteCartItem = async (req, res) => {
    try {
        const userId = res.locals.user._id
        const productIdToDelete = req.params.id
        const user = await User.findById(userId)

        user.cart = user.cart.filter(
            (item) => !item.productId.equals(productIdToDelete),
        )

        await user.save()
        res.redirect("/cart")
    } catch (error) {
        console.error(error.message)
    }
}

//GET
//@route /checkout
const checkoutPage = async (req, res) => {
    try {
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, private",
        )
        const user = await User.findById(res.locals.user._id)
        const userCart = await User.findOne({
            _id: res.locals.user._id,
        }).populate("cart.productId")
        if (!userCart.cart.length) {
            res.redirect("/cart")
        } else {
            res.render("user/checkout", {
                layout: "layouts/userLayout",
                user: user,
                userCart: userCart,
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    cartPage,
    addToCart,
    changeQuantity,
    deleteCartItem,
    checkoutPage,
}
