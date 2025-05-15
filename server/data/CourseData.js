const mongoose = require('mongoose');
const SemesterData = require('./SemesterData');
//目前想把course那邊的 groups刪掉改成反過來的 感覺邏輯上會比較通 然後我把Theme和DocumentData的semester欄位先刪掉 因為course那邊已經有了
const CourseDataSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
   semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData', required: true },//傳semester._id!
   // groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }], // 改成group ref Course?

    createdAt: { type: Date, default: Date.now }
});

CourseDataSchema.pre('save', async function (next) {
    if (!this.semester) {
        this.semester = (await SemesterData.getCurrentSemester())._id;
    }
    next();
});

module.exports = mongoose.model('CourseData', CourseDataSchema);