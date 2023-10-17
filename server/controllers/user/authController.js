const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../../models/User")
const { sendEmail, generateOTP } = require("../../utils/nodemailer")

let maxAge = 3 * 24 * 60 * 60

//GET
//@route /signup
const signupPage = async (req, res) => {
    const referalCode = req.query.code
    req.session.referalCode = referalCode
    try {
        const referingUser = await User.findOne({ _id: referalCode })
        if (referingUser) {
            await req.flash("success", `You were invited by ${referingUser.name}.`)
            await req.flash("success", "Signup to get ₹50.")
        } else {
            await req.flash("success", "Invalid referal link.")
        }
    } catch (error) {
        await req.flash("success", "Invalid referal link.")
    }
    const messages = await req.consumeFlash("success")
    ;(emailErr = false), (phoneErr = false)
    res.render("user/signup", {
        layout: "layouts/authLayout",
        emailErr,
        phoneErr,
        referalCode,
        messages
    })
}

//POST
// @route /signup
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body
    const emailExists = await User.findOne({ email })
    const phoneExists = await User.findOne({ phone })
    if (emailExists) {
        ;(emailErr = true), (phoneErr = false)
        res.render("user/signup", {
            layout: "layouts/authLayout",
            emailErr,
            phoneErr,
        })
    } else if (phoneExists) {
        ;(phoneErr = true), (emailErr = false)
        res.render("user/signup", {
            layout: "layouts/authLayout",
            phoneErr,
            emailErr,
        })
    } else {
        try {
            req.session.userData = { name, email, phone, password }
            console.log(req.session.referalCode)
            const generatedOTP = generateOTP()
            req.session.generatedOTP = generatedOTP
            console.log(generatedOTP)

            await sendEmail(email, generatedOTP)

            res.redirect("/verify")
        } catch (error) {
            console.log(error)
        }
    }
})

//GET
//@route /verify
const verifyOtp = asyncHandler(async (req, res) => {
    res.render("user/otp", { layout: "layouts/authLayout" })
})

//POST
//@route /verify
const validateOtp = asyncHandler(async (req, res) => {
    const number = ""
    const { n, u, m, b, e, r } = req.body
    const enteredOTP = Number(number.concat(n, u, m, b, e, r))
    const { name, email, phone, password } = req.session.userData

    if (enteredOTP === req.session.generatedOTP) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
        })
        console.log(req.session)
        if (req.session.referalCode) {
            try {
                const referalCode = req.session.referalCode
                const referingUser = await User.findOne({ _id:referalCode })
                console.log("referingUser")
                console.log(referingUser)
                if (referingUser) {
                    await User.findByIdAndUpdate(req.session.referalCode, { $inc: { wallet: 200 } })
                    await User.findByIdAndUpdate(user._id, { $inc: { wallet: 50 } })
                    await req.flash("success", "₹50 credited to your wallet.Check wallet in account section for more details.")
                } else {
                    console.log("Invalid referal link")
                    await req.flash("success", "Invalid referal link.")
                }
            } catch (error) {
                console.log(error)
                await req.flash("info", "Invalid referal link.")
            }
        }
        const payload = {
            user: {
                _id: user._id,
            },
        }
        let adminToken = jwt.sign(payload, process.env.jwtSecretKey, {
            expiresIn: maxAge,
        })
        res.cookie("user_access", adminToken, { httpOnly: true })
        res.redirect("/")
    } else {
        res.render("user/otp", { layout: "layouts/authLayout" })
    }
})

//GET
//@route /login
const loginPage = asyncHandler(async (req, res) => {
    ;(emailErr = false), (passErr = false), (blockErr = false)
    res.render("user/login", {
        layout: "layouts/authLayout",
        passErr,
        emailErr,
        blockErr,
    })
})

//POST
// @route /login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user) {
        if (user.isBlocked) {
            ;(passErr = false), (emailErr = false), (blockErr = true)
            res.render("user/login", { layout: "layouts/authLayout", blockErr })
        } else {
            if (await bcrypt.compare(password, user.password)) {
                const payload = {
                    user: {
                        _id: user._id,
                    },
                }
                let adminToken = jwt.sign(payload, process.env.jwtSecretKey, {
                    expiresIn: maxAge,
                })
                res.cookie("user_access", adminToken, { httpOnly: true })
                res.redirect("/")
            } else {
                ;(passErr = true), (emailErr = false), (blockErr = false)
                res.render("user/login", {
                    layout: "layouts/authLayout",
                    passErr,
                })
            }
        }
    } else {
        ;(emailErr = true), (passErr = false), (blockErr = false)
        res.render("user/login", { layout: "layouts/authLayout", emailErr })
    }
})

//GET
//@route /logout
const logout = asyncHandler(async (req, res) => {
    res.clearCookie("user_access")
    res.redirect("/login")
})

module.exports = {
    signupPage,
    loginPage,
    registerUser,
    loginUser,
    logout,
    verifyOtp,
    validateOtp,
}
