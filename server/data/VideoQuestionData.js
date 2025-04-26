const mongoose = require('mongoose')
//

const VideoQuestionSchema = new mongoose.Schema({
  videoname: {
    type: String,
    required: true,
    trim: true, // 移除多餘空格
  },
  timeStamp: {
    type: Number,
    required: true,
    min: 0, // 確保時間戳不為負數
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  choices: [{
    text: {
      type: String,
      required: true, // 每個選項的文字
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true, // 是否為正確答案
      default: false,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // 自動更新 updatedAt 欄位
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

// 確保每個 videoname 和 timeStamp 的組合最多只有一個問題
VideoQuestionSchema.index({ videoname: 1, timeStamp: 1 }, { unique: true });//


let VideoQuestionDataModel = mongoose.model('VideoQuestionDataModel', VideoQuestionDataModel)
module.exports = VideoQuestionDataModelModel
