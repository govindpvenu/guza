const mongoose = require("mongoose")

let couponModel = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    couponCode: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    minPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    user: {
        type: Array,
    },
})

module.exports = mongoose.model("coupon", couponModel)
