const progressService = require('../services/progressService');

exports.updateProgress = async (req, res) => {
    try {
        const result = await progressService.updateProgress(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getStudentProgress = async (req, res) => {
    try {
        const result = await progressService.getStudentProgress(req.params);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.checkItemProgress = async (req, res) => {
    try {
        const result = await progressService.checkItemProgress(req.params);
        if (!result) {
            return res.status(404).json({ message: '尚無進度紀錄' });
        }
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
