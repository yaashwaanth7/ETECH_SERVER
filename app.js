const express = require("express");
const course = require("./routes/courseRoutes.js");
const user = require("./routes/userRoutes.js");
const payments = require("./routes/paymentRoutes");
const others = require("./routes/otherRoutes")
const {ErrorMiddleware} = require("./middleware/Error.js");
const cookieParser = require("cookie-parser");
const app = express();

// using middlewares
app.use(express.json());  // req.body karna hai tho ye dono use karna padaga
app.use(express.urlencoded({   
    extended:true
}));

app.use(cookieParser());  // req.cookies ka liya use karna hai

// Importing and using routes

app.use("/api/v1",course);
app.use("/api/v1",user);
app.use("/api/v1",payments);
app.use("/api/v1",others);

app.use(ErrorMiddleware);

module.exports=app;