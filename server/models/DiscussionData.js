const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
    user: {//多型參照
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['StudentUser', 'ExternalUser', 'AdminUserData']
    },

    post: { type: mongoose.Schema.Types.ObjectId, ref: 'PostData', required: true }, // 屬於哪篇貼文的

    content: { type: String, required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DiscussionData', DiscussionSchema);
