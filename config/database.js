const mongoose = require("mongoose");
const dotenv = require("dotenv");


exports.connectDatabase = ()=>{
    mongoose.set("strictQuery",false);
      mongoose.connect(process.env.MONGO_URI).then(c=>{
          console.log(`Mongodb Connected to:${c.connection.host}`)
      }).catch(error=>{
          console.log(error);
      })
}


