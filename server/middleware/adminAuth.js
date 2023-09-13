const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    isAdminAuth:(req,res,next) =>{
        const token = req.cookies.admin_access;
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        if (!token) {
            next()
        }else{
            jwt.verify(token, process.env.jwtSecretKey, (err, payload) => {
                if(err){
                    console.log(err.message);
                    next()//this will reload the login page
                }else{
                    res.redirect('/admin')
                }
              })
        }
    },
    isAdmin:(req,res,next) =>{
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        const token = req.cookies.admin_access;
        if (!token) {
            res.redirect('/admin/login');
        }else{
            jwt.verify(token, process.env.jwtSecretKey, (err, payload) => {
                if(err){
                    console.log(err.message);
                    res.redirect('/admin/login')
                }else{
                    // req.user = {
                    //     id: payload.id
                    // }
                    next()//this give access to the route
                }
              })
        }
    }
}
