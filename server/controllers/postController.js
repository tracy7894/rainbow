const postService = require('../services/postService');

exports.createPost = async (req, res) => {
    try {
        const data = {
            title: req.body.title,
            course: req.body.course,
            content: req.body.content,
            user: req.user.userId,
            userModel: req.user.userModel
        };
        const post = await postService.createPost(data);
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await postService.updatePost(id, req.body);
        if (!updated) {
            return res.status(404).json({ error: '找不到貼文' });
        }
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await postService.deletePost(id);
        if (!deleted) {
            return res.status(404).json({ error: '找不到貼文' });
        }
        res.json({ message: '貼文已刪除' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postService.getAllPosts();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await postService.getPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: '找不到貼文' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};