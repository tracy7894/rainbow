const profolioService = require('../services/profolioService');
const mongoose = require('mongoose'); // 用於 ObjectId 驗證

/**
 * GET /api/profolio/student/:studentId/:studentModel
 * 獲取指定學生的學習歷程數據
 */
exports.getProfolioByStudent = async (req, res) => {
    try {
        const { studentId, studentModel } = req.params;

        // 驗證 ID 格式
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: '無效的學生 ID 格式。' });
        }
        // 驗證學生模型名稱
        if (!['StudentUser', 'ExternalUser'].includes(studentModel)) {
            return res.status(400).json({ message: '無效的學生模型名稱。請使用 "StudentUser" 或 "ExternalUser"。' });
        }

        // 調用服務層獲取數據
        const profolio = await profolioService.getStudentProfolio(studentId, studentModel);

        if (!profolio) {
            // 理論上 getStudentProfolio 應該會創建一個，所以這裡 404 情況會很少見
            return res.status(404).json({ message: '找不到該學生的學習歷程數據。' });
        }
        res.status(200).json(profolio);
    } catch (error) {
        console.error(`API 錯誤 (獲取學習歷程): ${error.message}`);
        // 根據錯誤類型返回不同的 HTTP 狀態碼
        if (error.message.includes('找不到')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: '伺服器內部錯誤。' });
    }
};

/**
 * POST /api/profolio/recalculate/:studentId/:studentModel
 * 手動觸發指定學生的學習歷程數據重新計算
 * 適用於管理員操作或除錯，不建議前端頻繁直接調用
 */
exports.recalculateStudentProfolio = async (req, res) => {
    try {
        const { studentId, studentModel } = req.params;
        // 可選：如果你希望針對特定課程重新計算，可以在這裡從 req.query 或 req.body 獲取 courseId
        // const { courseId } = req.query; // 假設 courseId 放在查詢參數中

        // 驗證 ID 格式
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: '無效的學生 ID 格式。' });
        }
        // 驗證學生模型名稱
        if (!['StudentUser', 'ExternalUser'].includes(studentModel)) {
            return res.status(400).json({ message: '無效的學生模型名稱。請使用 "StudentUser" 或 "ExternalUser"。' });
        }
        // 如果有 courseId 參數，也進行驗證
        // if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
        //     return res.status(400).json({ message: '無效的課程 ID 格式。' });
        // }


        // 調用服務層重新計算，並傳遞可能的 courseId
        const updatedProfolio = await profolioService.recalculateProfolio(studentId, studentModel /*, courseId*/);

        res.status(200).json({ message: '學習歷程已成功重新計算並更新。', data: updatedProfolio });
    } catch (error) {
        console.error(`API 錯誤 (重新計算學習歷程): ${error.message}`);
        res.status(500).json({ error: '伺服器內部錯誤。' });
    }
};

/**
 * PUT /api/profolio/bonus/:studentId/:studentModel
 * 手動更新學生的 bonus 分數
 * 通常用於管理員操作
 */
exports.updateProfolioBonus = async (req, res) => {
    try {
        const { studentId, studentModel } = req.params;
        const { bonus } = req.body; // 從請求體中獲取 bonus 值

        // 驗證 ID 格式
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: '無效的學生 ID 格式。' });
        }
        // 驗證學生模型名稱
        if (!['StudentUser', 'ExternalUser'].includes(studentModel)) {
            return res.status(400).json({ message: '無效的學生模型名稱。請使用 "StudentUser" 或 "ExternalUser"。' });
        }
        // 驗證 bonus 值
        if (typeof bonus !== 'number' || bonus < 0) {
            return res.status(400).json({ message: '無效的 bonus 值。bonus 必須是非負數。' });
        }

        // 調用服務層更新 bonus
        const updatedProfolio = await profolioService.updateProfolioBonus(studentId, studentModel, bonus);

        res.status(200).json({ message: '獎勵分數已成功更新。', data: updatedProfolio });
    } catch (error) {
        if (error.message.includes('找不到')) {
            return res.status(404).json({ error: error.message });
        }
        console.error(`API 錯誤 (更新獎勵分數): ${error.message}`);
        res.status(500).json({ error: '伺服器內部錯誤。' });
    }
};

/**
 * GET /api/profolio/course/:courseId/students
 * 獲取指定課程下所有學生的學習歷程數據
 */
exports.getAllStudentsProfolioByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // 驗證 courseId 格式
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: '無效的課程 ID 格式。' });
        }

        // 調用服務層獲取數據
        const profolios = await profolioService.getAllStudentsProfolioByCourse(courseId);

        if (!profolios || profolios.length === 0) {
            return res.status(404).json({ message: '該課程下沒有找到任何學生的學習歷程數據。' });
        }
        res.status(200).json(profolios);
    } catch (error) {
        console.error(`API 錯誤 (獲取課程下所有學生學習歷程): ${error.message}`);
        // 根據錯誤類型返回不同的 HTTP 狀態碼
        if (error.message.includes('找不到')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: '伺服器內部錯誤。' });
    }
};
