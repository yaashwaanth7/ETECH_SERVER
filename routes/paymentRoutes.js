const express = require("express");
const { buySubscription, paymentVerification, getRazorPayKey, cancelSubscription } = require("../controllers/paymentController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

//buy subscription
router.route("/subscribe").get(isAuthenticated,buySubscription);

// verify payment and save reference in database...
router.route("/paymentVerification").post(isAuthenticated,paymentVerification);

// get razorpay key
router.route("/razorpaykey").get(getRazorPayKey);

// cancel subscription
router.route("/subscribe/cancel").delete(isAuthenticated,cancelSubscription);

module.exports=router;