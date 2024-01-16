const mongoose = require("mongoose");


const schema = new mongoose.Schema({

    user:{
        type:Number,
        default:0,

    },
    subscription:{
        type:Number,
        default:0,

    },
    views:{
        type:Number,
        default:0,

    },
   
   cretedAt:{
       type:Date,
       default:Date.now,
   }

});



schema.methods.comparePassword = async function(passsword){
  
    return await bcrypt.compare(passsword,this.password);

}


module.exports = mongoose.model("Stats",schema);