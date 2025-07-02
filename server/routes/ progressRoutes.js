const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// 新增或更新進度 會直接設定completed為true（無法更動）
router.post('/progress', progressController.updateProgress);

// 查詢某學生已完成的所有教材
router.get('/progress/:studentModel/:studentId', progressController.getStudentProgress);

// 查詢單一教材是否完成
router.get('/progress/:studentModel/:studentId/:itemModel/:itemId', progressController.checkItemProgress);

module.exports = router;
