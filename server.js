const app = require('./app');
const dotenv = require("dotenv");
const {connectDatabase} = require("./config/database.js");
const cloudinary = require("cloudinary");
const nodeCron = require("node-cron")
const Stats = require("./Model/Stats.js");
dotenv.config({path:"./config/config.env"})



// connecting to database
connectDatabase();

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key:process.env.CLOUDINARY_CLIENT_API ,
    api_secret:process.env.CLOUDINARY_CLIENT_SECRET
})

// create stats every month
nodeCron.schedule("0 0 0 1 * *",async()=>{ // every month 
  try{
    await Stats.create();

  }catch(error){
    console.log(error);
  }
})

// const temp = async() => {
//    await Stats.create({});
// }

// temp();

app.get((req,res)=>{
  res.send("Working fine")
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is listening to the port:${process.env.PORT}`);
})