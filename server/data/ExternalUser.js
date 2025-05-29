const mongoose = require('mongoose')
//要討論區 不分組
let ExternalUser = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, 
    class: { type: String },
    name: { type: String, required: true },
    age: { type: Number, required: true }, 
    gender: { type: String, required: true },
    reason: { type: String },//不願透露原因
    groupRole: { type: Number, default: 0 }, // 0:普通成員 1:組長
    identity: { type: Number, default: 0, required: true }, //0:未認證 1:學生 2:旁觀
    access: { type: Boolean, default: false, required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData', required: true }, // 學期
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseData' }], // 課程關聯
    createdAt: { type: Date, default: Date.now }
})
ExternalUser.pre('validate', async function (next) {
    if (this.semester) {
        let semester = await mongoose.model('SemesterData').findById(this.semester);
        if (semester && semester.semesterType !== "full") {
            return next(new Error("校外學生只能選擇一年制的學期"));
        }
    }
    next();
});
let ExternalUserModel = mongoose.model('ExternalUser', ExternalUser)
module.exports = ExternalUserModel
