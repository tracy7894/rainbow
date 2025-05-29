const mongoose = require('mongoose')
const Schema = mongoose.Schema;

MessageDataSchema = new Schema({
    username: { type: String, required: true },
    message: { type: String, default: null },
    image: { type: String, default: null }, 
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MessageData', MessageDataSchema);
