const mongoose = require('mongoose')
const Schema = mongoose.Schema;

MessageDataSchema = new Schema({
    username: { type: String, required: true },
    message: { type: String, default: null },
    image: { type: String, default: null }, 
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, 
    identity: { type: Number, required: true },
    studentType: { type: Number, required: true }, //1:校內 2:校外
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterData', required: true }, //學期
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MessageData', MessageDataSchema);
