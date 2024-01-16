const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../Model/User");
const sendToken = require("../utils/sendToken.js");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto"); 
const Course = require("../Model/Course");
const getDataUri = require("../utils/dataUri");
const cloudinary = require("cloudinary");
const Stats = require("../Model/Stats.js");


// register users
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{
    // const {
    //     name:name,
    //     email:email,
    //     password:password,
    // } = req.body;
    const {
        name,
        email,
        password,
    } = req.body;
    const file = req.file;


    if(!name||!email||!password ||!file){
        return next(new ErrorHandler("Please enter all the feilds",400));
    }

    let user = await User.findOne({email});

    if(user){
        return next(new ErrorHandler("User already Exists",409));
    }

    // Upload file on cloudinary
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user=await User.create({
        name,email,password,avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        },
    })
    sendToken(res,user,"Registered Successfully",201) 

})


// Login User

exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password} =req.body;
    // console.log("email",email,"password",password);
    if(!email||!password){
        return next(new ErrorHandler("Please enter all feilds",400));
    }

    const user = await User.findOne({email}).select("+password")
  
    if(!user){
        return next(new ErrorHandler("User Doesn't Exist",401))
    }
  
    const isMatched =await user.comparePassword(password);
     if(!isMatched){
        return next(new ErrorHandler("Incorrect Email or Password",401));
    }
    sendToken(res,user,`Welcome Back ${user.name}`,200);

})


// logout
exports.logout=catchAsyncErrors(async(req,res,next)=>{
   
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"Logged Out Successfully"
    })

})

// Get my profile

exports.getMyProfile=catchAsyncErrors(async(req,res,next)=>{
   
    const user= await User.findById(req.user._id);

    res.status(200).json({
        success:true,
        user,
    })

})

//Change password

exports.changePassword=catchAsyncErrors(async(req,res,next)=>{
   
    const {oldPassword,newPassword} =req.body;

    if(!oldPassword || !newPassword){
        return next(new ErrorHandler("Enter all feilds",400));
    }

    const user= await User.findById(req.user._id).select("+password");

    const isMatched = await user.comparePassword(oldPassword);

    if(!isMatched){
        return next(new ErrorHandler("Incorrect Old password",400))
    }

    user.password=newPassword;

    await user.save();

    res.status(200).json({
        success:true,
        message:"Password Changed Successfully"
    })

})


// Update profile

exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
   
    const {name,email} =req.body;

    const user= await User.findById(req.user._id).select("+password");


    if(name){
        user.name=name;
    }
    if(email){
        user.email=email;
    }
    await user.save();

    res.status(200).json({
        success:true,
        message:"Profile Updated Successfully"
    })

});


// Update profile picture

exports.updateProfilePicture=catchAsyncErrors(async(req,res,next)=>{
   
// cloudinary 
    const file = req.file;
    const user = await User.findById(req.user._id);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar={
        public_id:myCloud.public_id,
        url:myCloud.secure_url
    }
    await user.save();

    res.status(200).json({
        success:true,
        message:"Profile Picture Updated Successfully"
    })

})

// Forgot Password
exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>{
   
    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return next(new ErrorHandler("User not found with this email id",400));

    }

    const resetToken = await user.getResetToken();
    await user.save();

//  http://localhost:3000/resetpassword/dklsfdskfsdflkdsf
    const url =`${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click on the link to reset your password.${url}.If you have not requested please ignore.`

    // send token via email
    await sendEmail(user.email,"ETECH Reset Password",message);

    res.status(200).json({
        success:true,
        message:`Reset Token has been send to ${user.email}`
    })

})

// Reset Password
exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
   
    const {token} = req.params;

    const resetPasswordToken =crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken, 
        resetPasswordExpire:{
            $gt:Date.now(),
        }
    })

    if(!user){
        return next(new ErrorHandler("Token is invalid or has been expired"));
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save();

    res.status(200).json({
        success:true,
        message:"Password Changed Successfully"
    })

})

//Add to playlist 

exports.addToPlayList = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body.id)
    if(!course){
        return next(new ErrorHandler("Invalid Course Id",404));
    }

    const itemExist = user.playList.find((item)=>{
          if(item.course.toString()===course._id.toString()){
              return true;
          }
    })
    if(itemExist){
        return next(new ErrorHandler("Item already Exists",409))
    }
    
    user.playList.push({
        course:course._id,
        poster:course.poster.url,
    })
    
    await user.save();

    res.status(200).json({
        success:true,
        message:"added to playlist"
    })
    
})

//Remove from playlist 

exports.removeFromPlayList = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.query.id)
    if(!course){
        return next(new ErrorHandler("Invalid Course Id",404));
    }

   const newPlayList = user.playList.filter((item)=>{
       if(item.course.toString()!==course._id.toString()){
           return item;
       }
   })
    
    
    user.playList=newPlayList;
    await user.save();

    res.status(200).json({
        success:true,
        message:"removed from playlist"
    })
})


// Admin controllers

exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{

    const users =await User.find();

    res.status(200).json({
        success:true,
        users
    })
})

// updateUser role
exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{

    const {id} = req.params;
    const user =await User.findById(id);

    if(!user){
        return next(new ErrorHandler("User Doesn't Exist",401))
    }

    if(user.role === "user") {
        user.role="admin";
    }else{
        user.role="user";
    }

    await user.save();
    
    res.status(200).json({
        success:true,
        message:"Role Updated"
    })
})

// Delete User
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{

    const {id} = req.params;
    const user =await User.findById(id);

    if(!user){
        return next(new ErrorHandler("User Doesn't Exist",401))
    }

    // cancel subscription

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();
    
    res.status(200).json({
        success:true,
        message:"User Deleted Succesfully"
    })
})

// delete my profile
exports.deleteMyProfile = catchAsyncErrors(async(req,res,next)=>{

    const user =await User.findById(req.user._id);

   
    // cancel subscription

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();
    
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"User Deleted Succesfully"
    })
})


User.watch().on("change",async()=>{
    const stats = await Stats.find({}).sort({createdAt: "desc"}).limit(1);

    const subscriptions = await User.find({"subscription.status":"active"});

    stats[0].subscription = subscriptions.length;
    stats[0].user = await User.countDocuments();
    stats[0].cretedAt = new Date(Date.now());

    await stats[0].save();
    
})