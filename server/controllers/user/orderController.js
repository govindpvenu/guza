const asyncHandler = require('express-async-handler')

const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

//POST
//@route/checkout
 const placeOrder = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const user = await User.findById(userId);
    const address = user.address.find(address => address._id.toString() === req.body.address);

    const order = new Order({
      customerId: userId,
      quantity: req.body.quantity,
      price: req.body.salePrice,
      products: user.cart,
      totalAmount: req.body.total,
      shippingAddress: address,
      paymentDetails: req.body.payment_option,
    });

    const orderSuccess = await order.save();
    
    if (orderSuccess) {
      //Decrease product quantity
      for (const cartItem of user.cart) {
        var product = await Product.findById(cartItem.productId);
        if (product) {
          product.quantity -= cartItem.quantity;
          await product.save();
        }
      }
      // set stock status
      if (product.quantity<1) {
        product.stock_status ='Not Available'
        await product.save();
      }
      // Make the cart empty
      await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });

      if (order.paymentDetails === 'COD') {
        res.redirect('/success-page');
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};


//GET
 //@route//order-details/:id
const orderDetails = asyncHandler(async (req,res)=>{
        const order = await Order.findOne({_id: req.params.id}).populate('products.productId')
        res.render('user/order-details',{ layout: "layouts/userLayout",order: order})
})


//GET
 //@route/order-cancel/:id
const cancelOrder = asyncHandler(async (req,res)=>{
    const order = await Order.findByIdAndUpdate(req.params.id, {orderStatus : 'CANCELLED'});
    res.redirect('/account/orders')
})

//GET
 //@route/order-cancel/:id
 const successPage = asyncHandler(async (req,res)=>{
      res.render('user/success-page')
})

module.exports= {
  placeOrder,
  orderDetails,
  cancelOrder,
  successPage
}