const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({//題目
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // 選項
    correctAnswer: { type: Number, required: true } // 正確答案的index 問卷沒有正確答案用null 
});

const QuizDataSchema = new mongoose.Schema({//測驗＆問卷
    type: { type: Number, require: true }, //0：問卷 1：測驗
    title: { type: String, required: true },
    videoUrl: { type: String }, // 影片
    description: { type: String },//敘述
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now },
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeData', required: true }, // 所屬主題
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseData', required: true }, // 所屬課程
    timeLimit: { type: Date, require: true }//繳交期限
    
});

module.exports = mongoose.model('QuizData', QuizDataSchema);
