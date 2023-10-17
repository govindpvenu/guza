const { json } = require("body-parser")
const mongoose = require("mongoose")

const bannerSchema = mongoose.Schema(
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
        status: {
            type: String,
            required: true,
        },
        is_Deleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Banner", bannerSchema)
