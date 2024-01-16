const express = require("express");
const { authorizedAdmin, isAuthenticated, authorizedSubscribers } = require("../middleware/auth");
const singleUpload = require("../middleware/multer");
const { contact, request, getDashboardStats } = require("../controllers/otherControllers");
const router = express.Router();



// contact form 
router.route("/contact").post(contact)

// request form 
router.route("/courserequest").post(request)

// getAdmin Dashboard stats
router.route("/admin/stats").get(isAuthenticated,authorizedAdmin,getDashboardStats)

module.exports=router;