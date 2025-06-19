const mongoose = require('mongoose')
//管理者
let AdminUserData = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    identity: { type: Number, default: 3, required: true }, //權限 0:未認證 1:學生 2:旁觀 3管理者
    createdAt: { type: Date, default: Date.now },

})


let AdminUserDataModel = mongoose.model('AdminUserData', AdminUserData)
module.exports = AdminUserDataModel