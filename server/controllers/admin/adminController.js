const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');


//GET
//@route /admin/
const dashboard = (req, res) => {
    res.render("admin/index",{ layout: "layouts/adminLayout", })
}

//GET
//@route /admin/login
const adminLogin = (req, res) => {
    // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    emailErr = false, passErr = false
    res.render('admin/login-admin', { layout:"layouts/authLayout",passErr, emailErr })
}

//POST
//@route /admin/login
const adminVerify = async (req, res) => {
    // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const { email, password } = req.body
    const admin = await Admin.findOne({email});
    if (admin) {
        if (admin.password === password) {
            const payload = {
                admin: {
                  _id: admin._id,
                },
              };
            let adminToken = jwt.sign( payload , process.env.jwtSecretKey, { expiresIn: '5d' })
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
    // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.clearCookie('admin_access');
    res.redirect('/admin/login')
}
module.exports = {
    dashboard,
    adminLogin,
    adminVerify,
    adminLogout,
}