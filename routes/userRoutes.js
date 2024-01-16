const express = require("express");
const { registerUser, loginUser, logout,getMyProfile, 
    changePassword, updateProfile, updateProfilePicture, forgotPassword, resetPassword, addToPlayList,
     removeFromPlayList, getAllUsers, updateUserRole, deleteUser, deleteMyProfile } = require("../controllers/userController");
const { isAuthenticated, authorizedAdmin } = require("../middleware/auth");
const router = express.Router();
const singleUpload = require("../middleware/multer")

//To register a user.
router.route("/register").post(singleUpload,registerUser);

// Login 
router.route("/login").post(loginUser);

// Logout 
router.route("/logout").get(logout);

// Get my profile
router.route("/me").get(isAuthenticated,getMyProfile);

// Change password
router.route("/changepassword").put(isAuthenticated,changePassword);

// Update profile
router.route("/updateProfile").put(isAuthenticated,updateProfile);

// Update profile picture
router.route("/updateProfilePicture").put(isAuthenticated,singleUpload,updateProfilePicture);

// Forget Password
router.route("/forgetpassword").post(forgotPassword);

// Reset Password
router.route("/resetpassword/:token").put(resetPassword);

//add to playlist
router.route("/addtoplaylist").post(isAuthenticated,addToPlayList);

//Remove from playlist
router.route("/removeformplaylist").delete(isAuthenticated,removeFromPlayList);

//Admin routes

router.route("/admin/users").get(isAuthenticated,authorizedAdmin,getAllUsers);

router.route("/admin/users/:id").put(isAuthenticated,authorizedAdmin,updateUserRole)
.delete(isAuthenticated,authorizedAdmin,deleteUser);

// Delete my profile
router.route("/me").delete(isAuthenticated,deleteMyProfile)

module.exports=router;