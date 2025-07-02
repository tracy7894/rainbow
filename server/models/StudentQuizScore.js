const mongoose = require('mongoose');
//學生測驗成績紀錄
const StudentQuizScoreSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'studentModel' // 動態參照 studentModel
    },
    studentModel: { type: String, required: true, enum: ['StudentUser', 'ExternalUser'] },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizData', required: true },//改成QuizData
    answers: [// 選擇的答案 自動對應原始題目
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizData.questions' }, // 題目 ID
            selectedOption: Number
        }
    ],
    score: { type: Number, default: null },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentQuizScore', StudentQuizScoreSchema);
