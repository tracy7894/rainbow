const mongoose=require('mongoose')
let MaterialsData=new mongoose.Schema({
    title:{ type: String, required: true },
    descripition:{ type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    
})
let MaterialsDataModel=mongoose.model('MaterialsData',MaterialsData)
module.exports=MaterialsDataModel