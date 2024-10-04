const mongoose=require('mongoose')
let StudentUser=new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    group:String,
    class:String,
    access:{
        type:Boolean,
        default:false,
    }
})
let StudentUserModel=mongoose.model('StudentUser',StudentUser)
module.exports=StudentUserModel