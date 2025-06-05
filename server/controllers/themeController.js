const themeService = require('../services/themeService');
//新增主題
exports.createTheme = async (req, res) => {
    try {
        const theme = await themeService.createTheme(req.body);
        res.status(201).json(theme);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
//修改主題
exports.updateTheme = async (req, res) => {
    try {
        const theme = await themeService.updateTheme(req.params.id, req.body);
        if (!theme) return res.status(404).json({ error: 'Theme not found' });
        res.json(theme);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
//查詢全部主題
exports.getAllThemes = async (req, res) => {
    try {
        const themes = await themeService.getAllThemes();
        res.json(themes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
//修改重點介紹＆學習目標
exports.updateThemeFocus = async (req, res) => {
    try {
        const theme = await themeService.updateThemeFocus(req.params.id, req.body.focus);
        res.json({ message: '更新成功', theme });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
//查詢單一主題 byId
exports.getThemeById = async (req, res) => {
    try {
        const theme = await themeService.getThemeById(req.params.id);
        if (!theme) {
            return res.status(404).json({ error: 'Theme not found' });
        }
        res.json(theme);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};