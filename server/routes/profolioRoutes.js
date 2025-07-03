const express = require('express');
const router = express.Router();
const profolioController = require('../controllers/profolioController');


const { authMiddleware, adminMiddleware } = require('../middleware/auth');
// 獲取指定學生的學習歷程數據 修改回傳（
router.get('/profolio/student/:studentId/:studentModel',
    // authMiddleware, // 如果只有學生本人或管理員可以查看
    profolioController.getProfolioByStudent
);

// 觸發指定學生的學習歷程數據重新計算 
router.post('/profolio/recalculate/:studentId/:studentModel',
    // adminMiddleware, // 通常只有管理員才能觸發重新計算
    profolioController.recalculateStudentProfolio
);

// 手動更新學生的 bonus 分數
router.put('/profolio/bonus/:studentId/:studentModel',
    // adminMiddleware, // 通常只有管理員才能修改 bonus
    profolioController.updateProfolioBonus
);
// 新增路由：獲取指定課程下所有學生的學習歷程數據
router.get('/profolio/course/:courseId/students',
    // adminMiddleware, 
    profolioController.getAllStudentsProfolioByCourse
);
/*
"student": {
            "_id": ,
            "name": ""
        },
        "studentModel": "StudentUser",
        "themeCompletionRate": [
            {
                "themeId": "6800104cc317c4736b2c6302",
                "themeName": "theme1",
                "completionRate": 0,                            /該主題的教材閱讀完成率
                "quizzes": [
                    {
                        "quizId": "686565e120edc2e59cd69275",
                        "score": 67,                            /該主題的測驗分數（完成率）
                        "title": "Node.js 基礎測驗",
                        "type": 1
                    },
                    {
                        "quizId": "6865665cebb1b9ef7748bc18",   
                        "score": 100,                            /該主題的問卷分數（完成率）
                        "title": "課程滿意度",              
                        "type": 0
                    }
                ]
            },
        ],
        "CourseCompletionRate": 89,                              /總平均
        "bonus": 5,
    },
*/

module.exports = router;