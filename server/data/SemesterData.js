const mongoose = require('mongoose');

let SemesterDataSchema = new mongoose.Schema({
    name: { type: String,unique: true },  // 學期名稱（自動生成） 自動生成不能required會error!
    startDate: { type: Date, required: true }, // 開始日期
    endDate: { type: Date, required: true },   // 結束日期
    semesterType: { type: String, enum: ["half", "full"], required: true } // "half" = 上下學期, "full" = 全年制
});

// 自動計算學年與學期
SemesterDataSchema.pre("save", function (next) {
    if (!this.name) { 
        const currentYear = new Date().getFullYear() - 1911; // 轉換成民國年
        const startMonth = new Date().getMonth() + 1; // 取得當前月份（1-12）

        if (this.semesterType === "half") {
            // **上下學期制**
            if (startMonth >= 8 || startMonth <= 1) { 
                this.name = `${currentYear}-1`; // **8月～1月 為第一學期**
            } else { 
                this.name = `${currentYear - 1}-2`; // **2月～7月 為第二學期**
            }
        } else {
            // **一年制**
            this.name = `${currentYear}`;
        }
    }
    next();
});
SemesterDataSchema.statics.getCurrentSemester = async function () {
    const currentDate = new Date();
    const semester = await this.findOne({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
    });
    if (!semester) {
        throw new Error('No active semester found for the current date');
    }
    return semester;
};
let SemesterDataModel = mongoose.model('SemesterData', SemesterDataSchema);
module.exports = SemesterDataModel;
