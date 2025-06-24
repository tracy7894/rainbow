const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({//角色
    name: { type: String, required: true },        // 角色名稱
    age: { type: String, required: true },         // 年齡
    description: { type: String, required: true }  // 描述
});

const ScenarioDataSchema = new mongoose.Schema({//情境案例
    intro: { type: String, required: true },        // 情境簡介
    objective: { type: String, required: true },    // 學習目標
    keys: [{ type: String }],                       // 重點清單
    characters: [CharacterSchema],                  // 登場角色
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeData', required: true }, // 所屬主題
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseData', required: true }, // 所屬課程
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScenarioData', ScenarioDataSchema);