const mongoose = require('mongoose')
//管理者
let AdminUserData = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },

    createdAt: { type: Date, default: Date.now }
})


let AdminUserDataModel = mongoose.model('AdminUserData', AdminUserDataModel)
module.exports = AdminUserDataModel