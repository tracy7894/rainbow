const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

//測驗管理
router.post('/quiz', authMiddleware, adminMiddleware, quizController.createQuiz);
router.put('/quiz/:id', authMiddleware, adminMiddleware, quizController.updateQuiz);
router.get('/quiz/:id', quizController.getQuizById);
//給學生用 隱藏答案
router.get('/quiz/:id/for-student', quizController.getQuizForStudent);
router.get('/quizzes', quizController.getAllQuizzes);

// // 提交與查詢測驗成績 （可防止重複提交 自動批改 愈時無法提交）
router.post('/quiz/submit', authMiddleware, quizController.submitQuiz);
// 查詢特定學生 (特定模型) 在特定測驗/問卷的成績
router.get('/quiz/student/:studentId/:studentModel/quiz/:quizId', authMiddleware, quizController.getStudentQuizScoreForSingleQuiz
);

// 查詢特定學生 (特定模型) 的所有測驗與問卷成績
router.get('/quiz/student/:studentId/:studentModel', authMiddleware, quizController.getAllQuizScoresForStudent
);

// 查詢指定課程下，指定測驗/問卷的所有同學分數
router.get('/quiz/course/:courseId/quiz/:quizId', authMiddleware, adminMiddleware, quizController.getAllStudentScoresByCourseAndQuiz
);

// 查詢指定課程下，所有測驗/問卷的所有同學分數
router.get('/quiz/course/:courseId', authMiddleware, adminMiddleware, quizController.getAllStudentScoresByCourse
);

module.exports = router;
