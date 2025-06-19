const DiscussionData = require('../data/DiscussionData');

exports.createDiscussion = async (data) => {
    const discussion = new DiscussionData(data);
    return await discussion.save();
};

exports.updateDiscussion = async (id, user, newContent) => {
    const discussion = await DiscussionData.findById(id);
    if (!discussion) return null;

    if (!discussion.user.equals(user._id) || discussion.userModel !== user.modelName) {
        return null; // 使用者不是留言的本人
    }

    discussion.content = newContent;
    return await discussion.save();
};

exports.deleteDiscussion = async (id) => {
    const result = await DiscussionData.findByIdAndDelete(id);
    return result;
};

exports.getAllDiscussions = async () => {
    return await DiscussionData.find().populate('user').populate('course');
};

exports.getDiscussionById = async (id) => {
    return await DiscussionData.findById(id).populate('user').populate('course');
};

