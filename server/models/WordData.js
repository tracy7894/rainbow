const mongoose = require('mongoose');
//相關術語
const WordDataSchema = new mongoose.Schema({//單詞
    word: { type: String, required: true }, // 單字
    explanation: { type: String, required: true }, // 單字說明
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeData', required: true }, // 所屬主題
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseData', required: true }, // 所屬課程
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WordData', WordDataSchema);