const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');

let maxAge = 3 * 24 * 60 * 60;


//GET
//@route /admin/login
const adminLogin = (req, res) => {
    emailErr = false, passErr = false
    res.render('admin/login-admin', { layout:"layouts/authLayout",passErr, emailErr })
}


//POST
//@route /admin/login
const adminVerify = async (req, res) => {
    const { email, password } = req.body
    const admin = await Admin.findOne({email});
    if (admin) {
        if (admin.password === password) {
            const payload = {
                admin: {
                  _id: admin._id,
                },
              };
            let adminToken = jwt.sign( payload , process.env.jwtSecretKey, { expiresIn: maxAge })
            res.cookie('admin_access', adminToken, { httpOnly: true })
            res.redirect('/admin')
        } else {
            passErr = true,emailErr = false
            res.render('admin/login-admin', {layout:"layouts/authLayout", passErr })
        }
    }else {
        emailErr = true,passErr = false
        res.render('admin/login-admin', { layout:"layouts/authLayout",emailErr })
    }
}

//GET
//@route /logout
const adminLogout = (req, res) => {
    res.clearCookie('admin_access');
    res.redirect('/admin/login')
}
module.exports = {
    adminLogin,
    adminVerify,
    adminLogout,
}