const mongoose = require('mongoose');
//當中介表
const ThemeDataSchema = new mongoose.Schema({
    themeNumber: { type: Number, required: true, enum: [1, 2, 3, 4, 5, 6] }, // 固定六大主題
    themeName: { type: String, required: true }, // 主題名稱
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseData', required: true }, // 所屬課程
    createdAt: { type: Date, default: Date.now },
    //刪除semester欄位？ course有了
});

// 避免同一門課重複加入相同的主題
ThemeDataSchema.index({ course: 1, themeNumber: 1 }, { unique: true });

module.exports = mongoose.model('ThemeData', ThemeDataSchema);