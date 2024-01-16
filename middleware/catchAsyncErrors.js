// exports.catchAsyncErrors = ()=>{
//     return()
// }

//  or

const catchAsyncErrors=(passedFunction)=>(req,res,next)=>{
     Promise.resolve(passedFunction(req,res,next)).catch(next)
     // next -> next handler ko call karega and agar nahi hai tho errorhandler ko call karaga
}

module.exports=catchAsyncErrors;