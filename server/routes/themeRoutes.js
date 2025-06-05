const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

router.post('/theme', themeController.createTheme);//新增主題
router.put('/theme/:id', themeController.updateTheme);//修改主題
router.get('/theme', themeController.getAllThemes);//查詢全部主題
router.patch('/theme/:id/focus', themeController.updateThemeFocus);//修改重點介紹＆學習目標
router.get('/theme/:id', themeController.getThemeById);//查詢單一主題 byId
module.exports = router;
