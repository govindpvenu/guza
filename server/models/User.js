const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required: [true,"Enter your name "],
    },
    email:{
        type:String,
        required: [true,"Enter your email "],
        unique: [true,"Email address already taken"],
        // match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

    },
    phone:{
        type:String,
        required: [true,"Enter your phone "],
        unique: [true,"Phone number already taken"],
        // match:/^\d{9,15}$/
    },
    password:{
        type:String,
        required: [true,"Enter your password"],
        // match:/^.{8,}$/
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    address:[
                {
                    name: {type:String},
                    mobile: {type:Number},
                    state:{type:String},
                    district: {type:String},
                    city: {type:String},
                    pin: {type:Number},
                    address:{type:String}
                }
            ]
},

{
    timestamps:true
}
)

module.exports = mongoose.model("User",userSchema)