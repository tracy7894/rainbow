const mongoose = require('mongoose')
const Schema = mongoose.Schema;
//分組聊天室訊息
MessageDataSchema = new Schema({
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser' }],
    message: { type: String, default: null },
    image: { type: String, default: null }, 
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MessageData', MessageDataSchema);
