const mongoose = require('mongoose');

// 學生學習歷程
let ProfiloData = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'studentModel' // 動態參照 studentModel
    },
    studentModel: {type: String,required: true,enum: ['StudentUser', 'ExternalUser']},
    themeCompletionRate: [
        {
            themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeData' },
            completionRate: { type: Number, default: 0 } // 0-100 的百分比
        }
    ],
    CourseCompletionRate: { type: Number, default: 0 }, // 課程完成度
    bonus: { type: Number } // 加分
});

let ProfiloDataModel = mongoose.model('ProfiloData', ProfiloData);
module.exports = ProfiloDataModel;
