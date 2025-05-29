const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
    // 多型參照，user 可是 Student / ExternalUser / AdminUserData
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Student', 'ExternalUser', 'AdminUserData']
    },

    course: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseData', required: true },

    content: { type: String, required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DiscussionData', DiscussionSchema);
