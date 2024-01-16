const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    razorpay_payment_id:{
        type: String,
        required: true,
    },
    razorpay_order_id:{
        type: String,
        required: true,
    },
    razorpay_signature:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model("Payment",schema);