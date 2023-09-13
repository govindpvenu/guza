const { json } = require('body-parser');
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    regular_price:{
        type:Number,
        required:true
    },
    sales_price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    category:{
        type:Object,
        required:true
    },
    images:{
        type:Array,
        required:true
    },
    date: {
        type: Date,
        default: Date.now,
      },
      is_Listed:{
        type:Boolean,
        default:true
    }
},
)

module.exports = mongoose.model("Product",productSchema)