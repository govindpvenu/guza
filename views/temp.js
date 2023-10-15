const brands = await Product.aggregate([
    {
        $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] },
    },
    {
        $group: {
            _id: "$brand",
            products: { $push: "$$ROOT" },
            firstImage: { $first: { $arrayElemAt: ["$images", 0] } },
            productCount: { $sum: 1 },
        },
    },
    {
        $project: {
            _id: 0,
            brand: "$_id",
            firstImage: 1,
            productCount: 1,
        },
    },
])
4
4.5
5
5.5
6
6.5
7
7.5
8
8.5
9
9.5
10
10.5
11
11.5
12
// 088178 bg color

// <!-- <div class="mb-4 row align-items-center">
// <label
//     class="col-sm-3 col-form-label form-label-title">Images</label>
// <div class="col-sm-9">
//     <div class="col-sm-9">
//         <!-- Display existing images -->
//         <% for (let i = 0; i < product.images.length; i++) { %>
//             <div>
//                 <img src="/images/<%= product.images[i] %>" alt="Product Image">
//                 <button type="button" class="btn btn-danger btn-sm remove-image" data-index="<%= i %>">Remove</button>
//             </div>
//         <% } %>

//         <!-- Input for adding new images -->
//         <input name="new_images" type="file" multiple>
//     </div>
// </div>

//     <!-- <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
//     <div class="field">
//         <h3>Upload or Edit Images</h3>
//         <input type="file" id="files" name="image" multiple />
//         <div id="existing-images">

//           <% for (let i = 0; i < product.images.length; i++) { %>
//             <div class="pip">
//               <img class="imageThumb" src="/images/<%= product.images[i] %>" />
//               <br />
//               <span class="remove">Remove image</span>
//             </div>
//             <% } %>
//         </div>
//       </div> -->

// </div>
// </div>
const brandsss = await Product.aggregate([
    {
        $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] },
    },
    {
        $group: {
            _id: "$brand",
            products: { $push: "$$ROOT" },
            productCount: { $sum: 1 },
        },
    },
    {
        $project: {
            _id: 0,
            brand: "$_id",
            productCount: 1,
        },
    },
])
const product_type = await Product.aggregate([
    {
        $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] },
    },
    {
        $group: {
            _id: "$brand",
            products: { $push: "$$ROOT" },
            productCount: { $sum: 1 },
        },
    },
    {
        $project: {
            _id: 0,
            brand: "$_id",
            productCount: 1,
        },
    },
])

//POST
//@route/place-order
const placeOrder = async (req, res) => {
    try {
        const userId = res.locals.user._id
        const user = await User.findById(userId)
        const address = user.address.find((address) => address._id.toString() === req.body.address)

        const order = new Order({
            customerId: userId,
            quantity: req.body.quantity,
            price: req.body.salePrice,
            products: user.cart,
            totalAmount: req.body.total,
            shippingAddress: address,
            paymentDetails: req.body.payment_option,
        })

        const orderSuccess = await order.save()
        const orderId = order._id

        if (orderSuccess) {
            //Decrease product quantity
            for (const cartItem of user.cart) {
                var product = await Product.findById(cartItem.productId)
                if (product) {
                    product.quantity -= cartItem.quantity
                    await product.save()
                }
            }
            // set stock status
            if (product.quantity < 1) {
                product.stock_status = "Not Available"
                await product.save()
            }
            // Make the cart empty
            await User.updateOne({ _id: userId }, { $unset: { cart: 1 } })

            if (order.paymentDetails === "COD") {
                console.log("COD")
                // res.render('user/success-page');
                res.redirect("/success-page")
            } else if (req.body.payment_option === "razorpay") {
                console.log("razorpay")

                const amount = req.body.total * 100 // Amount in paise
                const options = {
                    amount: amount,
                    currency: "INR",
                    receipt: orderId,
                }

                // Create a Razorpay order
                razorpay.orders.create(options, (err, order) => {
                    if (!err) {
                        console.log("Razorpay order created")
                        console.log(orderId)

                        // Send Razorpay response to the client
                        res.status(200).send({
                            success: true,
                            msg: "Order created",
                            order_id: order.id,
                            amount: amount,
                            reciept: orderId,
                            key_id: process.env.RAZORPAY_KEY_ID,
                            contact: "9876543210",
                            name: "admin",
                            email: "admin@gmail.com",
                        })
                    } else {
                        console.error("Razorpay order creation failed:", err)
                        res.status(400).send({
                            success: false,
                            msg: "Something went wrong!",
                        })
                    }
                })
            }
        }
    } catch (error) {
        console.error(error.message)
    }
}

//veerify payment

const verifyPayment = async (req, res) => {
    try {
        console.log("this is id:", req.body.orderId)
        console.log("this is id1:", req.body)
        console.log("this is id2:", req.body.payment)
        const kk = await Order.find({
            _id: new mongoose.Types.ObjectId(req.body.orderId),
        }).lean()
        if (kk) console.log(kk)
        console.log(req.body.orderId)
        const crypto = require("crypto")
        let hmac = crypto.createHmac("sha256", "rzp_test_7ETyzh4jBTZxal")
        hmac.update(req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id)
        hmac = hmac.digest("hex")

        if (hmac == req.body.payment.razorpay_signature) {
            console.log("call comes here")
            console.log(typeof req.body.orderId)
            await Order.updateOne({ _id: new mongoose.Types.ObjectId(req.body.orderId) }, { $set: { paymentStatus: "RECEIVED", orderStatus: "PLACED" } }).lean()

            res.status(200).json({ status: "success", msg: "Payment verified" })
        } else {
            res.status(400).json({
                status: "error",
                msg: "Payment verification failed",
            })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ status: "error", msg: "Internal server error" })
    }
}
//   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
//   <script>

//      $(document).ready(function(){
//          $('.payment-form').submit(function(e){
//              e.preventDefault()
//              var formData = $(this).serialize();
//              $.ajax({
//                  url : "/place-order",
//                  method : "post",
//                  data : formData,
//                  success : function(res) {
//                      if(res.success){
//                          var options = {
//                              "key":""+res.key_id+"",
//                              "amount" : ""+res.amount+"",
//                              "currency" : "INR",
//                              "order_id" : ""+res.order_id+"",
//                              "receipt" : ""+res.receipt+"",

//                              "handler":function(response){
//                                  alert(res.reciept)
//                                  alert("payment success")
//                                  verifyPayment(response, res.order_id ,res.reciept)

//                              },
//                              "prefill" : {
//                                  "contact" : ""+res.contact+"",
//                                  "name" : ""+res.name+"",
//                                  "email" : ""+res.email+""
//                              },
//                              "theme" : {
//                                  "color" : "#2300a3"
//                              }
//                          }
//                          var razorpayObj = new Razorpay(options);
//                          razorpayObj.on('payment.failed', function(response){
//                              alert("payment failed")
//                          })
//                          razorpayObj.open();
//                      }else{
//                          alert(res.msg)
//                      }
//                  }
//              })
//          })
//      })

//      function verifyPayment(payment, order, orderId) {
//              alert("cal comes")
//              alert(orderId)
//              alert(payment)
//              alert(order)
//              $.ajax({
//                  url: '/verify-payment',
//                  data: {
//                      payment,
//                      order,
//                      orderId
//                  },
//                  method: 'post',
//                  success: function () {

//                      Swal.fire({
//                          title: 'Order Placed Successfully!',
//                          text: 'View your orders',
//                          icon: 'success',
//                          showConfirmButton: true,
//                          confirmButtonText: "View order"
//                      }).then(function () {
//                          // window.location.href = "http://localhost:3000/account"

//                      })
//                  }
//              })
//          }
//    </script>

let a = "d"
console.log(a)

//POST
//@route/place-order
const placeOrder = async (req, res) => {
    try {
        const userId = res.locals.user._id
        const user = await User.findById(userId)
        const address = user.address.find((address) => address._id.toString() === req.body.address)

        const order = new Order({
            customerId: userId,
            quantity: req.body.quantity,
            price: req.body.salePrice,
            products: user.cart,
            totalAmount: req.body.total,
            shippingAddress: address,
            paymentDetails: req.body.payment_option,
        })

        const orderSuccess = await order.save()
        const orderId = order._id

        if (orderSuccess) {
            //Decrease product quantity
            for (const cartItem of user.cart) {
                var product = await Product.findById(cartItem.productId)
                if (product) {
                    product.quantity -= cartItem.quantity
                    await product.save()
                }
            }
            // set stock status
            if (product.quantity < 1) {
                product.stock_status = "Not Available"
                await product.save()
            }
            // Make the cart empty
            await User.updateOne({ _id: userId }, { $unset: { cart: 1 } })

            if (order.paymentDetails === "COD") {
                console.log("COD")
                // res.render('user/success-page');
                res.redirect("/success-page")
            } else if (req.body.payment_option === "razorpay") {
                console.log("razorpay")

                const amount = req.body.total * 100 // Amount in paise
                const options = {
                    amount: amount,
                    currency: "INR",
                    receipt: orderId,
                }

                // Create a Razorpay order
                razorpay.orders.create(options, (err, order) => {
                    if (!err) {
                        console.log("Razorpay order created")
                        console.log(orderId)

                        // Send Razorpay response to the client
                        res.status(200).send({
                            success: true,
                            msg: "Order created",
                            order_id: order.id,
                            amount: amount,
                            reciept: orderId,
                            key_id: process.env.RAZORPAY_KEY_ID,
                            contact: "9876543210",
                            name: "admin",
                            email: "admin@gmail.com",
                        })
                    } else {
                        console.error("Razorpay order creation failed:", err)
                        res.status(400).send({
                            success: false,
                            msg: "Something went wrong!",
                        })
                    }
                })
            }
        }
    } catch (error) {
        console.error(error.message)
    }
}


