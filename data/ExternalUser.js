const mongoose=require('mongoose')
let ExternalUser=new mongoose.Schema({
    username: { type: String, required: true },
    password:{ type: String, required: true },
    groupId:{ type: String , default:null},
    name:{ type: String, required: true },
    age:{ type: String, required: true },
    gender:{ type: String, required: true },
    groupRole: { type: String, default: '成員' }, // 預設為普通成員
    access:{
        type:Boolean,
        default:false,
    }
})
let ExternalUserModel=mongoose.model('ExternalUser',ExternalUser)
module.exports=ExternalUserModel