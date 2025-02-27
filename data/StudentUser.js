const mongoose = require('mongoose')

let StudentUser = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, // 關聯 Group
    class: { type: String, required: true },
    academicYear: { type: String, required: true }, // 學年
    gradeLevel: { type: String, required: true },  // 年級
    groupRole: { type: Number, default: 0 }, // 0:普通成員 1:組長
    identity: { type: Number, default: 0, required: true }, //0:未認證 1:學生 2:旁觀 99:老師
    access: { type: Boolean, default: false, required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData', required: true }, // 關聯 Semester 學期
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseData' }], // 課程關聯
    createdAt: { type: Date, default: Date.now }
})

let StudentUserModel = mongoose.model('StudentUser', StudentUser)
module.exports = StudentUserModel
