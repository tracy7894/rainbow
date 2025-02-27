const mongoose = require('mongoose')

let Group = new mongoose.Schema({
    name: { type: String, required: true }, 
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser' }], // 存學生 
    createdAt: { type: Date, default: Date.now }
})

let GroupModel = mongoose.model('Group', Group)
module.exports = GroupModel
