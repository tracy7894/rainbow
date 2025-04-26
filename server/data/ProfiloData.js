const mongoose = require('mongoose')

let ProfiloData = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser', required: true },
    themeCompletionRate: [
        {
            themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeData' },
            completionRate: { type: Number, default: 0 } // 0-100 的百分比
        }
    ],
    CourseCompletionRate: { type:Number, default: 0 },//課程完成度
    bonus: { type: Number  }//加分 
})
let ProfiloDataModel = mongoose.model('ProfiloData', ProfiloData)
module.exports = ProfiloDataModel
