const PostData = require('../models/PostData');

exports.createPost = async (data) => {
    const post = new PostData(data);
    return await post.save();
};

exports.updatePost = async (id, data) => {
    return await PostData.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deletePost = async (id) => {
    return await PostData.findByIdAndDelete(id);
};

exports.getAllPosts = async () => {
    return await PostData.find().populate('user').populate('course');
};

exports.getPostById = async (id) => {
    return await PostData.findById(id).populate('user').populate('course');
};
