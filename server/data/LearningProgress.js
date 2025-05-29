const mongoose = require("mongoose");

let LearningProgressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "studentModel"  // 動態參考 studentModel
    },
    studentModel: {
        type: String,
        required: true,
        enum: ["StudentUser", "ExternalUser"]  // 限定可參考的模型名稱
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "itemModel"  // 動態參考 itemModel
    },
    itemModel: {
        type: String,
        required: true,
        enum: ["DocumentData", "WordData", "ScenarioData"] // 限定可參考的模型名稱
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
});
LearningProgressSchema.index({ student: 1, studentModel: 1, item: 1, itemModel: 1 }, { unique: true });

module.exports = mongoose.model("LearningProgress", LearningProgressSchema);

