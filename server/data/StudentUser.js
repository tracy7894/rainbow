const mongoose = require('mongoose')

let StudentUser = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, // 關聯 Group
    class: { type: String },//班級
    academicYear: { type: String, required: true }, // 學年  計畫人員 四技 二技
    gradeLevel: { type: String},  // 年級
    groupRole: { type: Number, default: 0 }, // 0:普通成員 1:組長
    identity: { type: Number, default: 0, required: true }, //權限 0:未認證 1:學生 2:旁觀 
    access: { type: Boolean, default: false, required: true },//認證
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData', required: true }, // 關聯 Semester 學期
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseData' }], // 課程關聯
    createdAt: { type: Date, default: Date.now }
})
StudentUser.pre('validate', async function (next) {
    if (this.semester) {
        let semester = await mongoose.model('SemesterData').findById(this.semester);
        if (semester && semester.semesterType !== "half") {
            return next(new Error("校內學生只能選擇上下學期制的學期"));
        }
    }
    next();
});
let StudentUserModel = mongoose.model('StudentUser', StudentUser)
module.exports = StudentUserModel
