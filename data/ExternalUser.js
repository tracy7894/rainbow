const mongoose=require('mongoose')
let ExternalUser=new mongoose.Schema({
    username: { type: String, required: true },
    password:{ type: String, required: true },
    group:{ type: String },
    name:{ type: String, required: true },
    age:{ type: String, required: true },
    gender:{ type: String, required: true },
    access:{
        type:Boolean,
        default:false,
    }
})
let ExternalUserModel=mongoose.model('ExternalUser',ExternalUser)
module.exports=ExternalUserModel