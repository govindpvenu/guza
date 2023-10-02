const { json } = require("body-parser")
const mongoose = require("mongoose")

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: String,
            required: true,
        },
        is_Listed: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
)

module.exports = mongoose.model("Category", categorySchema)
