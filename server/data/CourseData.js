const mongoose = require('mongoose');
const SemesterData = require('./SemesterData');
//複製課程功能
const CourseDataSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData', required: true },//傳semester._id!
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }], // 改成group ref Course?

    createdAt: { type: Date, default: Date.now }
});

CourseDataSchema.pre('save', async function (next) {
    if (!this.semester) {
        this.semester = (await SemesterData.getCurrentSemester())._id;
    }
    next();
});

module.exports = mongoose.model('CourseData', CourseDataSchema);