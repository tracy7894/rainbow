const mongoose=require('mongoose')
let StudentUser=new mongoose.Schema({
    username:{ type: String, required: true },
    password:{ type: String, required: true },
    name:{ type: String, required: true },
    groupId:{ type: String, default: null },
    class:{ type: String, default: null },
    academicYear: { type: String, required: true }, // 學年
    gradeLevel: { type: String, required: true },  // 年級
    groupRole: { type: String, default: '成員' }, // 預設為普通成員

    access:{
        type:Boolean,
        default:false,
    }
})
let StudentUserModel=mongoose.model('StudentUser',StudentUser)
module.exports=StudentUserModel