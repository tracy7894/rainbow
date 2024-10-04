const mongoose=require('mongoose')
let ExternalUser=new mongoose.Schema({
    username:String,
    password:String,
    group:String,
    name:String,
    age:Number,
    gender:String,

    access:{
        type:Boolean,
        default:false,
    }
})
let ExternalUserModel=mongoose.model('ExternalUser',ExternalUser)
module.exports=ExternalUserModel