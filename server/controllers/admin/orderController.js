const asyncHandler = require('express-async-handler')
const Order = require('../../models/Order')



//GET
//@route /orders/
const orders = asyncHandler(async (req, res) => {
    const orders = await Order.find();
    const allOrders = await Order.find({}).populate('products.productId')
    console.log(orders[0].products[0].productId);
    res.render('admin/orders',{layout: "layouts/adminLayout",orders,allOrders})
})

// cancel order

const adminCancelOrder = async (req,res)=>{
    try {
        const id = req.params.id;
        const update = {
            orderStatus : 'CANCELLED'
        }
        const order = await Order.findByIdAndUpdate(id,update);

        res.redirect('/admin/orders')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    orders,
    adminCancelOrder

}