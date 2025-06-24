const discussionService = require('../services/discussionService');

exports.createDiscussion = async (req, res) => {
    try {
        const data = {
            user: req.user.userId,
            userModel: req.user.userModel,
            course: req.body.course,
            content: req.body.content
        };
        const discussion = await discussionService.createDiscussion(data);
        res.status(201).json(discussion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await discussionService.updateDiscussion(id, {
            userId: req.user.userId,
            userModel: req.user.userModel,
            content: req.body.content
        });

        if (!updated) {
            return res.status(403).json({ error: '無權限修改此留言或留言不存在' });
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await discussionService.deleteDiscussion(id);
        if (!deleted) {
            return res.status(404).json({ error: '留言不存在' });
        }
        res.json({ message: '刪除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllDiscussions = async (req, res) => {
    try {
        const discussions = await discussionService.getAllDiscussions();
        res.json(discussions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDiscussionById = async (req, res) => {
    try {
        const discussion = await discussionService.getDiscussionById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ error: '留言不存在' });
        }
        res.json(discussion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
