const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Stats = require("../Model/Stats");
const ErrorHandler = require("../utils/errorHandler");
const { sendEmail } = require("../utils/sendEmail");





exports.contact = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,message} = req.body

    if(!name || !email || !message){
        return next(new ErrorHandler("All feild are mandatory"))
    }
    const to = process.env.MY_MAIL
    const subject = "Contact from LMS"
    const text = `I am ${name} and my Email is ${email}. \n ${message}`
    await sendEmail(to,subject,text);

    res.status(200).json({
        success: true,
        message: "Your message has been sent"
        
    })
})

exports.request = catchAsyncErrors(async(req,res,next)=>{

    
    const {name,email,course} = req.body
    if(!name || !email || !course){
        return next(new ErrorHandler("All feild are mandatory"))
    }
    const to = process.env.MY_MAIL
    const subject = "Request for a course on LMS"
    const text = `I am ${name} and my Email is ${email}. \n ${course}`
    await sendEmail(to,subject,text);
    
    res.status(200).json({
        success: true,
        message: "Your message has been sent..."

    })
})


// stats

exports.getDashboardStats = catchAsyncErrors(async(req,res,next) =>{

    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(12);

    const statsData = [];

    for(let i = 0 ; i < stats.length ; i++){
        statsData.unshift(stats[i])
    }

    const requiredSize = 12 - stats.length;

    for(let i = 0 ; i < requiredSize ; i++){
        statsData.unshift({
            user: 0,
            subscription:0,
            views: 0
        })
    }


    const userCount = statsData[11].user;
    const subscriptionsCount = statsData[11].subscription;
    const viewCount = statsData[11].views;


    let usersProfit = true, viewsProfit = true, subscriptionProfit = true;
    let usersPrecentage = 0, viewsPercentage = 0, subscriptionPercentage = 0;

    if(statsData[10].user === 0 ) usersPrecentage = userCount * 100;
    if(statsData[10].views === 0 ) viewsPercentage = viewCount * 100;
    if(statsData[10].subscription === 0 ) subscriptionPercentage = subscriptionsCount * 100;

    else{
        const difference = {
            users: statsData[11].user - statsData[10].user,
            views: statsData[11].views - statsData[10].views,
            subscription: statsData[11].subscription - statsData[10].subscription,
        }

        usersPrecentage = (difference.users/statsData[10].user)*100;
        viewsPercentage = (difference.views/statsData[10].views)*100;
        subscriptionPercentage = (difference.subscription/statsData[10].subscription)*100;

        if(usersPrecentage < 0 ) usersProfit = false;
        if(viewsPercentage < 0 ) viewsProfit = false;
        if(viewsPercentage < 0 ) subscriptionPercentage = false;
    }

    res.status(200).json({
        success: true,
        stats: statsData, // whole year
        userCount, // last month
        subscriptionsCount,
        viewCount,
        subscriptionPercentage,
        viewsPercentage,
        usersPrecentage,
        viewsProfit,
        usersProfit,
        subscriptionProfit,

    })
})


