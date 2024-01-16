const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../Model/User");
const ErrorHandler = require("../utils/errorHandler");
const RazorPay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../Model/Payment");
exports.buySubscription=catchAsyncErrors(async(req,res,next)=>{


    // const user = await User.findById(req.user._id);

    // if(user.role==='admin'){
    //     return next(new ErrorHandler("Admin can't buy subscription",400));
    // }

    // const plan_id = process.env.PLAN_ID || "plan_7wAosPWtrkhqZw"

    // const subscription= await instance.subscriptions.create({
    //     plan_id: plan_id,
    //     customer_notify: 1,
    //     total_count: 12,
    //   });

    //   user.subscription.id = subscription.id;

    //   user.subscription.status=subscription.status;

    //   await user.save();

    //   res.status(201).json({
    //       success:true,
    //       subscriptionId:subscription.id
    //   })


    const user = await User.findById(req.user._id);

     if(user.role==='admin'){
            return next(new ErrorHandler("Admin can't buy subscription",400));
        }
    
    const plan_id = process.env.PLAN_ID || "plan_NOScr64HQ9dHQk"

    // razory pay instance
    const instance = new RazorPay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
})

    const subscription = await instance.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12,

    
      })

      user.subscription.id = subscription.id;
      user.subscription.status = subscription.status;

      await user.save();

      res.status(201).json({
        success: true,
        subscriptionId: subscription.id
      })

})



exports.paymentVerification=catchAsyncErrors(async(req,res,next)=>{


    const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = req.body;


    const user = await User.findById(req.user._id);

    const subscription_id = user.subscription.id;

    const generated_Signature = crypto.createHmac("sha256",process.env.RAZORPAY_SECRET).update(razorpay_payment_id + "|" + subscription_id,"utf-8").digest("hex");

    const isAuthentic = generated_Signature === razorpay_signature

    if(isAuthentic) return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`)

    // database comes here
    await Payment.create({
        razorpay_signature,
        razorpay_order_id,
        razorpay_payment_id
    })

    user.subscription.status= "active";

    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)

     if(user.role==='admin'){
            return next(new ErrorHandler("Admin can't buy subscription",400));
        }
    
    const plan_id = process.env.PLAN_ID || "plan_NOScr64HQ9dHQk"

    // razory pay instance
    const instance = new RazorPay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
    })

    const subscription = await instance.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12,

    
      })

      user.subscription.id = subscription.id;
      user.subscription.status = subscription.status;

      await user.save();

      res.status(201).json({
        success: true,
        subscriptionId: subscription.id
      })

})

 exports.getRazorPayKey = catchAsyncErrors(async(req,res,next) => {
    res.status(200).json({
        success:true,
        key: process.env.RAZORPAY_API_KEY
    })
})


exports.cancelSubscription = catchAsyncErrors(async(req,res,next) => {
    const instance = new RazorPay({
        key_id:process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
    })
    const user = await User.findById(req.user._id);
    const subscriptionId = user.subscription.id;
   

    let refund = false;


    await instance.subscriptions.cancel(subscriptionId);

    const payment = await Payment.findOne({
        razorpay_order_id: subscriptionId,
    })

    const gap = Date.now() - payment.createdAt;

    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

    if(refundTime > gap){

        await instance.payments.refund(payment.razorpay_payment_id)
        refund = true;

    }

    await payment.remove()
    user.subscription.id = undefined
    user.subscription.status = undefined
    await user.save();

    res.status(200).json({
        success:true,
        message: refund ? "Subscription cancelled , You will recive full refund within 7 days." : "Subscription cancelled , no refund initiated as subscription was cancelled after 7 days."
    })
})