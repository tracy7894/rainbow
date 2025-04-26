const mongoose = require("mongoose");

let LearningProgressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "StudentUser", required: true }, // 學生 
    DocumentData: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentData", required: true }, // 單元
    completed: { type: Boolean, default: false }, // 教材or測驗是否完成
    completedAt: { type: Date, default: null } // 完成時間
});

let LearningProgressModel = mongoose.model("LearningProgress", LearningProgressSchema);
module.exports = LearningProgressModel;
