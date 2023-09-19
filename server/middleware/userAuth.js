const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    isUserAuth:(req,res,next) =>{
        const token = req.cookies.user_access;
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        if (!token) {
            res.locals.user = null;
            next()
        }else{
            jwt.verify(token, process.env.jwtSecretKey, async(err, payload) => {
                if(err){
                    console.log(err.message);
                    res.locals.user = null;
                    next()//this will reload the login/signup page
                }else{
                    let user = await User.findById(payload.user._id);
                    res.locals.user = user;
                    res.redirect('/')
                }
              })
        }
    },
    protectedRoute:(req,res,next) =>{
        const token = req.cookies.user_access;
        if (!token) {
            res.locals.user = null;
            res.redirect('/login');
        }else{
            jwt.verify(token, process.env.jwtSecretKey, async(err, payload) => {
                if(err){
                    console.log(err.message);
                    res.locals.user = null;
                    res.redirect('/login')
                }else{
                    // req.user = {
                    //     id: payload.id
                    // }
                    let user = await User.findById(payload.user._id);
                    res.locals.user = user;
                    module.exports.userData = user
                    next()//this give access to the route
                }
              })
        }
    },
    notProtectedRoute:(req,res,next) =>{
        const token = req.cookies.user_access;

        if (!token) {
            res.locals.user = null;
            next()
        }else{
            jwt.verify(token, process.env.jwtSecretKey, async(err, payload) => {
                if(err){
                    console.log(err.message);
                    res.locals.user = null;
                    res.next()
                }else{
                    // req.user = {
                    //     id: payload.id
                    // }
                    let user = await User.findById(payload.user._id);
                    res.locals.user = user;
                    next()//this give access to the route
                }
              })
        }
    }

}
