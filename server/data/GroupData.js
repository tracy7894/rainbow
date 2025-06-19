const mongoose = require('mongoose')

let GroupData = new mongoose.Schema({
    ID: { type: Number, required: true },//組別編號
    name: { type: String, required: true },//組別名
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser' }], // 擁有學生 外部不分組
    createdAt: { type: Date, default: Date.now }
})

let GroupDataModel = mongoose.model('GroupData', GroupData)
module.exports = GroupDataModel
