const mongoose = require('mongoose')

let SemesterData = new mongoose.Schema({
    name: { type: String, required: true }, // 例："XXX學期"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
})

let SemesterDataModel = mongoose.model('SemesterData', SemesterData)
module.exports = SemesterDataModel
