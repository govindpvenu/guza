const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const dotenv = require("dotenv").config()
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const methodOverride = require("method-override")
const { flash } = require("express-flash-message")
const Swal = require("sweetalert2")

const jwt = require("jsonwebtoken")
//routers
const userRouter = require("./server/routes/user")
const adminRouter = require("./server/routes/admin")

const app = express()
const port = process.env.PORT || 3000

//Session & cookies
app.use(cookieParser())
app.use(
    session({
        secret: "some secret",
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
        resave: false,
        saveUninitialized: false,
    }),
)

// setup flash
app.use(flash({ sessionKeyName: "express-flash-message" }))

//Template engine
app.use(expressLayouts)
app.set(
    "layout",
    "./layouts/authLayout",
    "./layouts/adminLayout",
    "./layouts/userLayout",
)
app.set("view engine", "ejs")

//bodyparser
app.use(bodyParser.urlencoded({ extended: false }))

//Database connection
const connectDB = require("./server/config/mongodb")
connectDB()

//serving public file
app.use(express.static(__dirname + "/public"))

//methodOvveride
app.use(methodOverride("_method"))

// parsing the incoming data
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//Routes
app.use("/", userRouter)
app.use("/admin", adminRouter)

//404
app.get("*", (req, res) => {
    res.status(404).render("404")
})

//start server
app.listen(port, () => console.log(`Server started on port ${port}`))
