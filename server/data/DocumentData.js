const mongoose = require('mongoose')

//文字內容
const TextSegmentSchema = new mongoose.Schema({
    text: { type: String, required: true }, // 段落文字內容
    link: { type: String, default: null }, 
    image: { type: String, default: null }
});

//
const DocumentDataSchema  = new mongoose.Schema({
    title: { type: String, required: true }, 
    contentType: { type: Number,enum: [0, 1, 2, 3, 4, 5], required: true }, // 0:一般教材 1:單詞 //2:影片 (暫定) 3:重點介紹 4:學習目標 5:情境案例 (不同輸入格式)
    video: { type: String, default: null }, // 內嵌影片路徑？ (待研究)
    reference: { type: String, default: null }, //參考連結 影片連結？
    word: { type: String, default: null }, // 單詞區塊
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeData', required: true }, // 所屬主題
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseData', required: true }, // 所屬課程
    content: [TextSegmentSchema], // 一般教材文字敘述
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DocumentData', DocumentDataSchema );