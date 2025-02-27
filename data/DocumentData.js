const mongoose = require('mongoose')

const TextSegmentSchema = new mongoose.Schema({
    text: { type: String, required: true }, // 段落文字內容
    fontSize: { type: Number, default: 1, required: true }, 
    bold: { type: Boolean, default: false }, 
    italic: { type: Boolean, default: false }, // 斜體
    underline: { type: Boolean, default: false }, // 底線
    strike: { type: Boolean, default: false }, // 刪除線
    link: { type: String, default: null }, 
    image: { type: String, default: null }
});

let DocumentData = new mongoose.Schema({
    title: { type: String, required: true }, 
    contentType: { type: Number, required: true }, // 0:一般教材 1:單詞
    bulletStyle: { type: Number, default: 0 }, // 項目符號
    numberingStyle: { type: Number, default: 0 }, // 編號
    video: { type: String, default: null },
    Reference: { type: String, default: null },
    word: { type: String, default: null }, // 單詞區塊
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData' }, //學期
    content: [TextSegmentSchema], 
    createdAt: { type: Date, default: Date.now }
})

let DocumentDataModel = mongoose.model('DocumentData', DocumentData)
module.exports = DocumentDataModel
