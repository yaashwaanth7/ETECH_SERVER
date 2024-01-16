const express = require("express");
const { getAllCourses,createCourses, getCoursesLectures, addLecture, deleteCourses, deleteLecture } = require("../controllers/courseControllers");
const { authorizedAdmin, isAuthenticated, authorizedSubscribers } = require("../middleware/auth");
const singleUpload = require("../middleware/multer");
const router = express.Router();

// Get all course courses without lecture
router.route("/courses").get(getAllCourses);

// create new course - only admin
router.route("/createcourse").post(isAuthenticated,authorizedAdmin,singleUpload,createCourses);

// Add lecture , Delete course , get Course Details
router.route("/course/:id")
.get(isAuthenticated,authorizedSubscribers,getCoursesLectures)
.post(isAuthenticated,authorizedAdmin,singleUpload,addLecture)
.delete(isAuthenticated,authorizedAdmin,deleteCourses);

// Delete Lecture
router.route("/lecture").delete(isAuthenticated,authorizedAdmin,deleteLecture);

module.exports=router;