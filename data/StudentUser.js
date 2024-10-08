const mongoose=require('mongoose')
let StudentUser=new mongoose.Schema({
    username:{ type: String, required: true },
    password:{ type: String, required: true },
    name:{ type: String, required: true },
    groupId:{ type: String, default: null },
    class:{ type: String, default: null },
    access:{
        type:Boolean,
        default:false,
    }
})
let StudentUserModel=mongoose.model('StudentUser',StudentUser)
module.exports=StudentUserModel