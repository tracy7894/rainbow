const mongoose=require('mongoose')
let materialsData=new mongoose.Schema({
    name:{ type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    
})
let materialsDataModel=mongoose.model('materialsData',materialsData)
module.exports=materialsDataModel