const jwt = require ("jsonwebtoken");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../Model/User");

exports.isAuthenticated = catchAsyncErrors(async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Please login to use these resources",401));
    }

    const decoded =jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);

    next();
})

exports.authorizedAdmin = (req,res,next)=>{
    if(req.user.role !== 'admin'){
        return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`,403));
    }
    next();
}

exports.authorizedSubscribers = (req,res,next)=>{
    if(req.user.subscription.status !== 'active' && req.user.role !== "admin"){
        return next(new ErrorHandler(`only subscribers can access this resource`,403));
    }
    next();
}