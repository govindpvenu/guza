const { json } = require('body-parser');
const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
        required:true
    },
    is_Listed:{
        type:Boolean,
        default:true
    },
    date: {
        type: Date,
        default: Date.now,
      },
},
)

module.exports = mongoose.model("Category",categorySchema)