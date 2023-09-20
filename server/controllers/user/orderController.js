const User = require('../../models/User');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Order = require('../../models/Order');
const mongoose = require('mongoose');
const { route } = require('../../routes/user');





//load order details page

const loadOrderDetails = async (req,res)=>{
    try {
        const orderId = req.params.id;
        // const order= await Order.findById(orderId);
        const order = await Order.findOne({_id: orderId}).populate('products.productId')
        console.log(order);
        console.log('details of 0th product');
        res.render('user/order-details',{ layout: "layouts/userLayout",order: order})

    } catch (error) {
        console.log(error.message);
    }
}
//POST
 //@route/checkout
 const checkout = async (req, res) => {
  try {
    
    console.log(req.body);
    const userId = res.locals.user._id;
    const user = await User.findById(userId);
    const cart = await User.findById(res.locals.user._id, { cart: 1, _id: 0 });
    console.log(cart.cart);
    console.log(req.body);
    const order = new Order({
      customerId: userId,
      quantity: req.body.quantity,
      price: req.body.salePrice,
      products: cart.cart,
      totalAmount: req.body.total,
      shippingAddress: req.body.address,
      paymentDetails: req.body.payment_option,
    });
    const orderSuccess = await order.save();
    console.log('order==',order);
    console.log('ordeRRRRRR');
    console.log(order._id);
    const orderId = order._id;
    console.log(orderSuccess);
    console.log(orderId);

    
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
        res.render('user/success-page');
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};





// cancel order

const cancelOrder = async (req,res)=>{
    try {
        const id = req.params.id;
        const update = {
            orderStatus : 'CANCELLED'
        }
        const order = await Order.findByIdAndUpdate(id,update);

        res.redirect('/account/orders')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports= {
    loadOrderDetails,
    checkout,
    cancelOrder,
}