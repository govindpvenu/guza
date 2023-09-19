const User = require('../../models/User');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
// const Order = require('../models/Orders');

  //GET
//@route /cart
const getCart = async (req,res)=>{
    try {

        const userCart = await User.findOne({_id:  res.locals.user._id}).populate('cart.productId')
        // console.log(JSON.stringify(userCart));
        // console.log(userCart);
        let grandTotal=0;
        for(let i =0;i<userCart.cart.length;i++){
            grandTotal= grandTotal + parseInt(userCart.cart[i].productId.sales_price)* parseInt(userCart.cart[i].quantity)
        }
        // console.log('grandTotal:'+grandTotal);
        // console.log(cartItems);
        res.render('user/cart', { layout: "layouts/userLayout" ,userCart: userCart,grandTotal: grandTotal})
    } catch (error) {
        console.log(error.message);
    }
}

//add to cart

const addToCart = async (req,res)=>{
    try {
        const productId = req.body.productId;
        const quantity = parseInt(req.body.quantity);
        // console.log('ADDTOCART productId-----'+productId+'   quantity-----' + quantity);

        if(isNaN(quantity) || quantity <= 0){
            res.status(400).json({ message: 'Invalid quantity' });
        }
        
        const userId = res.locals.user._id
        // console.log('ADDTOCART userId------'+userId);
        const user = await User.findById(userId);

        if(!user){
            res.status(404).json({message: 'user not found'})
        }

        const existingItem = user.cart.find((item) => (
            item.productId.equals(productId)
          ));
      
        if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            user.cart.push({ productId, quantity });
            // user.cart1.push({productId,quantity})
          }
      
          await user.save();

          // console.log('product added to cart')

        //   res.redirect('/cart')
        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
    }
}

// change quantity in cart

const changeQuantity = async (req,res)=>{
    console.log('count:'+req.body.count)
    console.log('productId:'+req.body.productId)
    req.body.count = parseInt(req.body.count)
    try {
        const data = await User.updateOne(
            {
              _id: res.locals.user._id,
               'cart.productId': req.body.productId,
            },
            {
              $inc: {
                'cart.$.quantity': req.body.count,
              }
            },
            {
                new:true
            }
        )
        console.log("Dataa:", data)
    } catch (error) {
        console.log(error.message);
    }
}

//delete cart item
const deleteCartItem = async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const productIdToDelete = req.params.id; 
  
      console.log('productId to remove:'+productIdToDelete);
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log('user:'+user);
      user.cart = user.cart.filter((item) =>
        !item.productId.equals(productIdToDelete)
      );
  
      await user.save();
  
      console.log("Product removed from cart");
  
      res.redirect('/cart')
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

//GET
//@route /checkout
  const getCheckout = async (req,res)=>{
   try {
    const user = await User.findById( res.locals.user._id)
    const userCart = await User.findOne({_id:  res.locals.user._id}).populate('cart.productId')

    // console.log(user);
    // console.log(userCart);
    console.log(userCart.address[0]);

    res.render('user/checkout', { layout: "layouts/userLayout" ,user: user,userCart: userCart})
  } catch (error) {
    console.log(error.message);  
   }
  }




 
module.exports = {
    getCart,
    getCheckout,
    addToCart,
    changeQuantity,
    deleteCartItem,

}