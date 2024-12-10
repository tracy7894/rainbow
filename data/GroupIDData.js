const mongoose=require('mongoose')
let GroupIDData=new mongoose.Schema({
    
    groupId:{ type: Number, required: true },
    type:{ type: String, required: true },
   // courseType: { type: String, required: true }
     // internal or external
})
let GroupIDDataModel=mongoose.model('GroupIDData',GroupIDData)
module.exports=GroupIDDataModel