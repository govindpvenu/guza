const { check, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const user = require("../middleware/userAuth")
const User = require("../models/User")

const userValidation = [
    check("name").exists().isLength({ min: 3 }).withMessage("Name must be more than 3 characters long"),
    check("email", "Email is not valid")
        .isEmail()
        .custom(async (value) => {
            if (value == user.userData.email) return
            const emailExists = await User.find({ value })
            if (emailExists) {
                throw new Error("E-mail already in use")
            }
        }),
    check("phone")
        .isNumeric()
        .withMessage("Mobile number should only contain numbers")
        .isLength({ min: 10 })
        .withMessage("Mobile number must have atleast 10 numbers")
        .custom(async (value) => {
            if (value === user.userData.phone) return
            const emailExists = await User.find({ value })
            if (emailExists) {
                throw new Error("Mobile number already in use")
            }
        }),
    check("password", "Password Must Be at Least 8 Characters")
        .isLength({ min: 8 })
        .custom(async (value) => {
            if (value.length < 8) return
            if (!(await bcrypt.compare(value, user.userData.password))) {
                throw new Error("Your current password is wrong")
            }
        }),
    check("npassword").custom(async (value) => {
        npassword = value
        if (value) {
            if (value.length < 8) {
                throw new Error("New password Must Be at Least 8 Characters")
            }
        }
    }),
    check("cpassword").custom(async (value) => {
        changePassword = false
        if (value) {
            if (value.length < 8 || value !== npassword) {
                throw new Error("Confirm password should match the new password")
            }
            changePassword = true
        }
    }),
]
const addressValidator = [
    check("name")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Name must be alphabetic."),
    check("state")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("State must be alphabetic."),
    check("district")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("District must be alphabetic."),
    check("city")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("City must be alphabetic."),
    check("mobile").isNumeric().withMessage("Mobile must be number."),
    check("pin").isNumeric().withMessage("PIN must be number."),
]

module.exports = {
    userValidation,
    addressValidator,
}
