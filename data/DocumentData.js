const mongoose=require('mongoose')
let DocumentData=new mongoose.Schema({
    title:{type: String, require:true},
    content:{type: String}
})
let DocumentDataModel=mongoose.model('DocumentData',DocumentData)
module.exports=DocumentDataModel