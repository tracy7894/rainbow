const mongoose = require('mongoose');
//學生測驗成績紀錄
//防止重複提交api
const StudentQuizScoreSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "StudentUser", required: true }, // 學生 

    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{ type: Number, required: true }], // 選擇的答案
    score: { type: Number ,default:null},
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentQuizScore', StudentQuizScoreSchema);
