const mongoose = require("mongoose")
mongoose.set("strictQuery", false)
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_CONNECT)
        console.log(`Database Connected:${conn.connection.host}`)
    } catch (error) {
        console.error(error)
    }
}
module.exports = connectDB
