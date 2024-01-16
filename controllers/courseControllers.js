const  catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const Course=require("../Model/Course.js");
const Stats = require("../Model/Stats.js");
const getDataUri = require("../utils/dataUri.js");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");

// get all courses without lectures
exports.getAllCourses=catchAsyncErrors(async(req,res,next)=>{
    
    const keyword = req.query .keyword || ""
    const category = req.query.category || ""
    const courses = await Course.find({
        title:{
            $regex: keyword,
            $options: "i"
        },
        category:{
            $regex: category,
            $options: "i"
        }
    }).select("-lectures");
    res.status(200).json({
        success:true,
        courses
    })
})

// create new course --Admin
exports.createCourses=catchAsyncErrors(async(req,res,next)=>{
    const {title,description,category,createdBy} = req.body;
    if(!title || !description || !category || !category){
        return next(new ErrorHandler("Please add all feilds",400));
    }

    const file = req.file;
    console.log(file);
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    
    const course=await Course.create({
        title,description,category,createdBy,poster:{
            // public_id:"sample_id", // cloudinary sa melaga
            // url:"smaple_url"
            public_id:mycloud.public_id, // cloudinary sa melaga
            url:mycloud.secure_url
        }
    });
    res.status(201).json({
        success:true,
        message:"Course Created successfully. You can add lectures now.",
        course
    })
})



// Get course Details
exports.getCoursesLectures=catchAsyncErrors(async(req,res,next)=>{
    const course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorHandler("Course not found",404));
    }

   course.views+=1;

    await course.save();
    res.status(200).json({
        success:true,
        lectures:course.lectures,
    })
})

// max video size 100mb allowed
// Add lecture 
exports.addLecture=catchAsyncErrors(async(req,res,next)=>{

    const {id} = req.params;
    const {title,description} = req.body;

    const course = await Course.findById(id);

    if(!course){
        return next(new ErrorHandler("Course not found",404));
    }

     const file = req.file;
     const fileUri = getDataUri(file);
     const mycloud = await cloudinary.v2.uploader.upload(fileUri.content,{
         resource_type:"video",
     })


   // upload file here
   course.lectures.push({
       title,description,video:{
           public_id:mycloud.public_id,
           url:mycloud.secure_url,
       }
   })
  
    course.numOfVideos=course.lectures.length;
    await course.save();
    res.status(200).json({
        success:true,
        message:"Lectures added in course"
    })
})


//Delete course
exports.deleteCourses=catchAsyncErrors(async(req,res,next)=>{
  const {id} = req.params;

  const course = await Course.findById(id);
   if(!course){
       return next(new ErrorHandler("Course not found",404));
   }
   await cloudinary.v2.uploader.destroy(course.poster.public_id);


   for(let i=0;i<course.lectures.length;i++){
       const singleLectures = course.lectures[i];
   await cloudinary.v2.uploader.destroy(singleLectures.video.public_id,{
       resource_type:"video"
   });

   }

   await Course.remove();

    res.status(201).json({
        success:true,
        message:"Course Deleted successfully.",
    })

})


// Delete lecture
exports.deleteLecture=catchAsyncErrors(async(req,res,next)=>{

  const {courseId,lectureId} = req.query;

  const course = await Course.findById(courseId);
   if(!course){
       return next(new ErrorHandler("Course not found",404));
   }

   const lecture = course.lectures.find((item)=>{
       if(item._id.toString()=== lectureId.toString()){
           return item;
       }
   })
   await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
       resource_type:"video"
   });

   course.lectures = course.lectures.filter((item)=>{
       if(item._id.toString()!==lectureId.toString()){
           return item;
       }
   })

   course.numOfVideos = course.lectures.length;
   await course.save();


    res.status(201).json({
        success:true,
        message:"Lecture Deleted successfully.",
    })
})


Course.watch().on("change", async()=>{
    const stats = await Stats.find({}).sort({createdAt: "desc"}).limit(1);

    const courses = await Course.find({});


    let totalViews = 0;

    for (let i = 0; i < courses.length; i++) {
        totalViews += courses[i].views;
        
    }

    stats[0].views = totalViews;
    stats[0].cretedAt = new Date(Date.now());

    await stats[0].save();

})