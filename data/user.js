const mongoose=require('mongoose')
let userData=new mongoose.Schema({
    username:String,
    password:String,
})
let userModel=mongoose.model('users',userData)
module.exports=userModel