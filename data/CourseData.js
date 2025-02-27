const mongoose = require('mongoose')

let CourseData = new mongoose.Schema({
    courseName: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser' }], // 學生選課
    externalUser:[{type: mongoose.Schema.Types.ObjectId, ref: 'ExternalUser' }],
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData', required: true }, // 學期
    createdAt: { type: Date, default: Date.now }
})

let CourseDataModel = mongoose.model('CourseData', CourseData)
module.exports = CourseDataModel
