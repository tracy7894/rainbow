const quizService = require('../services/quizService');
const mongoose = require('mongoose');
exports.createQuiz = async (req, res) => {
    try {
        const result = await quizService.createQuiz(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const result = await quizService.updateQuiz(req.params.id, req.body);
        if (!result) return res.status(404).json({ error: 'Quiz not found' });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const result = await quizService.getQuizById(req.params.id);
        if (!result) return res.status(404).json({ error: 'Quiz not found' });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getQuizForStudent = async (req, res) => {
    try {
        const result = await quizService.getQuizForStudent(req.params.id);
        if (!result) return res.status(404).json({ error: 'Quiz not found' });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllQuizzes = async (req, res) => {
    try {
        const result = await quizService.getAllQuizzes();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const { student, studentModel, quizId, answers } = req.body;
        let actualStudentId = student; // 預設從 req.body 獲取

        // 如果你使用了 authMiddleware 並且它成功附加了 req.user
        if (req.user && req.user.userId) {
            actualStudentId = req.user.userId;
        }
        if (!actualStudentId) {
            // 可能是沒有 token 或 req.body.student 不存在
            return res.status(401).json({ message: '未授權：無法獲取使用者 ID。' });
        }
        if (!studentModel) {
            return res.status(400).json({ message: 'studentModel 欄位是必填的。' });
        }
        if (!quizId) {
            return res.status(400).json({ message: 'quizId 欄位是必填的。' });
        }
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'answers 欄位是必填的且必須為陣列。' });
        }
        const submissionData = {
            student: actualStudentId,
            studentModel: studentModel,
            quizId: quizId,
            answers: answers
        };

        const result = await quizService.submitQuiz(submissionData);

        res.status(201).json(result);

    } catch (err) {
        console.error("提交測驗時發生錯誤:", err); 
        res.status(400).json({ error: err.message });
    }
};

/**
 * GET /api/student-quiz-scores/student/:studentId/:studentModel/quiz/:quizId
 * 取得特定學生 (特定模型) 在特定測驗/問卷的成績
 */
exports.getStudentQuizScoreForSingleQuiz = async (req, res) => {
    try {
        const { studentId, studentModel, quizId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ message: '無效的學生 ID 或測驗/問卷 ID 格式。' });
        }
        if (!['StudentUser', 'ExternalUser'].includes(studentModel)) {
            return res.status(400).json({ message: '無效的學生模型名稱。' });
        }

        const scoreRecord = await quizService.getStudentQuizScoreByStudentAndQuiz(studentId, studentModel, quizId);

        res.status(200).json(scoreRecord);
    } catch (error) {
        if (error.message.includes('找不到')) {
            return res.status(404).json({ error: error.message });
        }
        console.error(`API 錯誤 (取得單一測驗成績): ${error.message}`);
        res.status(500).json({ error: '伺服器內部錯誤。' });
    }
};

/**
 * GET /api/student-quiz-scores/student/:studentId/:studentModel
 * 取得特定學生 (特定模型) 的所有測驗與問卷分數
 */
exports.getAllQuizScoresForStudent = async (req, res) => {
    try {
        const { studentId, studentModel } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: '無效的學生 ID 格式。' });
        }
        if (!['StudentUser', 'ExternalUser'].includes(studentModel)) {
            return res.status(400).json({ message: '無效的學生模型名稱。' });
        }

        const scores = await quizService.getAllStudentQuizScoresByStudent(studentId, studentModel);

        res.status(200).json(scores);
    } catch (error) {
        console.error(`API 錯誤 (取得學生所有成績): ${error.message}`);
        res.status(500).json({ error: '伺服器內部錯誤。' });
    }
};

/**
 * GET /api/student-quiz-scores/course/:courseId/quiz/:quizId
 * 取得指定課程下，指定測驗/問卷的所有同學分數
 */
exports.getAllStudentScoresByCourseAndQuiz = async (req, res) => {
    try {
        const { courseId, quizId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ message: '無效的課程 ID 或測驗/問卷 ID 格式。' });
        }

        const scores = await quizService.getAllStudentScoresByCourseAndQuiz(courseId, quizId);

        res.status(200).json(scores);
    } catch (error) {
        if (error.message.includes('不存在') || error.message.includes('不屬於')) {
            return res.status(404).json({ error: error.message });
        }
        console.error(`API 錯誤 (取得課程下指定測驗所有學生分數): ${error.message}`);
        res.status(500).json({ error: '伺服器內部錯誤。' });
    }
};

/**
 * GET /api/student-quiz-scores/course/:courseId
 * 取得指定課程下，所有測驗/問卷的所有同學分數
 */
exports.getAllStudentScoresByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: '無效的課程 ID 格式。' });
        }

        const scores = await quizService.getAllStudentScoresByCourse(courseId);

        res.status(200).json(scores);
    } catch (error) {
        console.error(`API 錯誤 (取得課程下所有測驗的所有學生分數): ${error.message}`);
        res.status(500).json({ error: '伺服器內部錯誤。' });
    }
};