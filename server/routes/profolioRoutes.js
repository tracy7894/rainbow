const express = require('express');
const router = express.Router();
const profolioController = require('../controllers/profolioController');


// const authMiddleware = require('../middlewares/authMiddleware').authMiddleware; 
// const adminMiddleware = require('../middlewares/authMiddleware').adminMiddleware; 

// 獲取指定學生的學習歷程數據
router.get('/student/:studentId/:studentModel',
    // authMiddleware, // 如果只有學生本人或管理員可以查看
    profolioController.getProfolioByStudent
);

// 觸發指定學生的學習歷程數據重新計算
router.post('/recalculate/:studentId/:studentModel',
    // adminMiddleware, // 通常只有管理員才能觸發重新計算
    profolioController.recalculateStudentProfolio
);

// 手動更新學生的 bonus 分數
router.put('/bonus/:studentId/:studentModel',
    // adminMiddleware, // 通常只有管理員才能修改 bonus
    profolioController.updateProfolioBonus
);
// 新增路由：獲取指定課程下所有學生的學習歷程數據
router.get('/course/:courseId/students',
    // adminMiddleware, 
    profolioController.getAllStudentsProfolioByCourse
);

module.exports = router;