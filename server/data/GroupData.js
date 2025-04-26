const mongoose = require('mongoose')

let GroupData = new mongoose.Schema({
    ID: { type: Number, require: true },
    name: { type: String, required: true },
    description: { type: String },//?????
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser' }], // 存學生 
    createdAt: { type: Date, default: Date.now }
})

let GroupDataModel = mongoose.model('GroupData', GroupData)
module.exports = GroupDataModel
