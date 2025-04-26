const mongoose = require('mongoose')

let AdminUserData = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },

    createdAt: { type: Date, default: Date.now }
})


let AdminUserDataModel = mongoose.model('AdminUserDataModel', AdminUserDataModel)
module.exports = AdminUserDataModelModel
