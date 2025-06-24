const DiscussionData = require('../models/DiscussionData');

exports.createDiscussion = async (data) => {
    const discussion = new DiscussionData(data);
    return await discussion.save();
};

exports.updateDiscussion = async (id, { userId, userModel, content }) => {
    const discussion = await DiscussionData.findById(id);
    if (!discussion) return null;

    if (!discussion.user.equals(userId) || discussion.userModel !== userModel) {
        return null;
    }

    discussion.content = content;
    return await discussion.save();
};

exports.deleteDiscussion = async (id) => {
    return await DiscussionData.findByIdAndDelete(id);
};

exports.getAllDiscussions = async () => {
    return await DiscussionData.find().populate('user')
};

exports.getDiscussionById = async (id) => {
    return await DiscussionData.findById(id).populate('user')
};
