const mongoose = require('mongoose')

let ExternalUser = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, 
    class: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true }, 
    gender: { type: String, required: true },
    groupRole: { type: Number, default: 0 }, // 0:普通成員 1:組長
    identity: { type: Number, default: 0, required: true }, //0:未認證 1:學生 2:旁觀
    access: { type: Boolean, default: false, required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData', required: true }, //學期
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseData' }], // 課程關聯
    createdAt: { type: Date, default: Date.now }
})

let ExternalUserModel = mongoose.model('ExternalUser', ExternalUser)
module.exports = ExternalUserModel
