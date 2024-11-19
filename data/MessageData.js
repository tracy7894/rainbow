const mongoose = require('mongoose');
const Schema = mongoose.Schema;
MessageDataSchema = new Schema({
  username: { type: String, required: true },
  message: { type: String, default: null },
  image: { type: String, default: null }, // Base64 image string if sent
  createdAt: { type: Date, default: Date.now },
  groupId: { type: String, required: true },
  identity: { type: String, required: true },
});

module.exports = mongoose.model('MessageData', MessageDataSchema);