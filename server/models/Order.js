const mongoose = require('mongoose');
const moment = require('moment-timezone');


const orderSchema = new mongoose.Schema({
    
    orderId: String,
    customerId: mongoose.Schema.Types.ObjectId,
    products: [{
        productId: {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: Number,
        price: Number,
    }],

    paymentMethod : String,
    orderStatus: {
        type : String,
        default: "PENDING"
    },
    paymentStatus: {
        type : String,
        default: "PENDING"
    },
    paymentDetails:{
        type: Object,
        default : 'COD'
    },

    totalItems : Number,
    totalAmount : Number,   
    discount: {
		type: Number,
		default: 0,
	},
    
    shippingAddress : {},
    createdAt: {
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    },
    updatedAt:{
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    }
});

module.exports = mongoose.model('Order',orderSchema);