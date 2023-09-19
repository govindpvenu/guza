const asyncHandler = require('express-async-handler')



//GET
//@route /orders/
const orders = asyncHandler(async (req, res) => {
    res.render('admin/orders',{layout: "layouts/adminLayout"})
})

module.exports = {
    orders,

}