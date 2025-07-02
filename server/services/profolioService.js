// services/profolioService.js

const mongoose = require('mongoose');
const ProfiloData = require('../models/ProfiloData');
const LearningProgress = require('../models/LearningProgress');
const StudentQuizScore = require('../models/StudentQuizScore');
const ThemeData = require('../models/ThemeData');
const CourseData = require('../models/CourseData'); // 引入課程模型 (如果 proflio 是針對特定課程，則此處會用到)
const StudentUser = require('../models/StudentUser');
const ExternalUser = require('../models/ExternalUser');

// 引入 LearningProgress 的動態參照模型，以便查詢它們的 'theme' 字段
const DocumentData = require('../models/DocumentData');
const WordData = require('../models/WordData');
const ScenarioData = require('../models/ScenarioData');
const QuizData = require('../models/QuizData'); // 引入 QuizData

// --- 常數定義 ---
const MAX_SCORE_PER_ITEM = 100; // 每個單一項目（教材或測驗/問卷）的最高分數，用於標準化計算
// 總主題數和每個主題的項目數將從數據庫動態獲取，而非硬編碼

// 獲取指定學生的學習歷程數據
exports.getStudentProfolio = async (studentId, studentModel) => {
    try {
        let profolio = await ProfiloData.findOne({ student: studentId, studentModel: studentModel })
            .populate({
                path: 'student',
                model: studentModel,
                select: 'name email studentId'
            })
            .populate({
                path: 'themeCompletionRate.themeId',
                model: 'ThemeData',
                select: 'name'
            })
            .exec();

        if (!profolio) {
            console.log(`為新學生 ${studentId} (${studentModel}) 創建並計算學習歷程數據。`);
            // 如果 profolio 不存在，先執行一次計算並保存
            profolio = await exports.recalculateProfolio(studentId, studentModel);
        }

        return profolio;
    } catch (error) {
        console.error(`獲取學生學習歷程時發生錯誤: ${error.message}`);
        throw error;
    }
};

/**
 * 重新計算並更新學生的學習歷程 (ProfiloData)
 * @param {string} studentId 學生ID
 * @param {string} studentModel 學生模型名稱
 * @param {string} [courseId=null] 可選：如果學習歷程是針對特定課程的，則傳入 courseId
 * @returns {Object} 更新或創建後的 ProfiloData 數據
 */
exports.recalculateProfolio = async (studentId, studentModel, courseId = null) => {
    try {
        let profolio = await ProfiloData.findOne({ student: studentId, studentModel: studentModel });

        if (!profolio) {
            profolio = new ProfiloData({
                student: studentId,
                studentModel: studentModel,
                themeCompletionRate: [],
                CourseCompletionRate: 0,
                bonus: 0
            });
        }

        // 根據是否傳入 courseId 來查詢主題
        const themeQuery = courseId ? { course: courseId } : {};
        const allThemes = await ThemeData.find(themeQuery).sort({ themeNumber: 1 }); // 依主題編號排序，確保順序

        if (allThemes.length === 0) {
            console.warn(`沒有找到任何${courseId ? '課程下' : ''}主題，無法計算學習歷程完成率。`);
            profolio.themeCompletionRate = [];
            profolio.CourseCompletionRate = 0;
            await profolio.save();
            return profolio;
        }

        const themeCompletionRates = [];
        let totalCourseCompletedPoints = 0; // 累積所有主題下各項目的完成點數
        let totalCourseMaxPoints = 0; // 累積所有主題下各項目的總滿分點數

        for (const theme of allThemes) {
            let currentThemeCompletedPoints = 0;
            let currentThemeMaxPoints = 0;

            // --- 1. 查詢該主題下所有的教材 ID (DocumentData, WordData, ScenarioData) ---
            const docsInTheme = await DocumentData.find({ theme: theme._id }).select('_id');
            const wordsInTheme = await WordData.find({ theme: theme._id }).select('_id');
            const scenariosInTheme = await ScenarioData.find({ theme: theme._id }).select('_id');

            const allLearningItemIdsInTheme = [
                ...docsInTheme.map(d => d._id),
                ...wordsInTheme.map(w => w._id),
                ...scenariosInTheme.map(s => s._id)
            ];

            // 獲取學生在這些 LearningProgress 項目中的完成狀態
            const studentLearningProgresses = await LearningProgress.find({
                student: studentId,
                studentModel: studentModel,
                item: { $in: allLearningItemIdsInTheme }
            });

            // 為每個學習項目計算分數
            for (const itemId of allLearningItemIdsInTheme) {
                const lp = studentLearningProgresses.find(p => p.item.equals(itemId));
                currentThemeMaxPoints += MAX_SCORE_PER_ITEM; // 每個學習項目最大貢獻 MAX_SCORE_PER_ITEM
                currentThemeCompletedPoints += (lp && lp.completed) ? MAX_SCORE_PER_ITEM : 0; // 如果完成則為 MAX_SCORE_PER_ITEM，否則為 0
            }

            // --- 2. 查詢該主題下所有的 QuizData ID ---
            const quizzesInTheme = await QuizData.find({ theme: theme._id }).select('_id');

            // 獲取學生在這些測驗/問卷中的成績
            const studentQuizScores = await StudentQuizScore.find({
                student: studentId,
                studentModel: studentModel,
                quizId: { $in: quizzesInTheme.map(q => q._id) }
            });

            // 為每個測驗/問卷計算分數
            for (const quiz of quizzesInTheme) { // 這裡直接用 quiz 物件，避免再次 map ID
                const sqs = studentQuizScores.find(s => s.quizId.equals(quiz._id));
                currentThemeMaxPoints += MAX_SCORE_PER_ITEM; // 每個測驗/問卷最大貢獻 MAX_SCORE_PER_ITEM
                currentThemeCompletedPoints += (sqs && sqs.score !== null) ? sqs.score : 0; // 如果有分數就加上，否則為 0
            }

            // --- 計算該主題的完成率 ---
            let themeCompletionPercentage = 0;
            if (currentThemeMaxPoints > 0) {
                themeCompletionPercentage = (currentThemeCompletedPoints / currentThemeMaxPoints) * 100;
            }
            themeCompletionRates.push({
                themeId: theme._id,
                completionRate: Math.min(100, themeCompletionPercentage) // 確保不超過 100%
            });

            // 累計到課程總點數
            totalCourseCompletedPoints += currentThemeCompletedPoints;
            totalCourseMaxPoints += currentThemeMaxPoints;
        }

        profolio.themeCompletionRate = themeCompletionRates;

        // --- 計算課程總完成度 (CourseCompletionRate) ---
        let courseOverallCompletionPercentage = 0;
        if (totalCourseMaxPoints > 0) {
            courseOverallCompletionPercentage = (totalCourseCompletedPoints / totalCourseMaxPoints) * 100;
        }
        profolio.CourseCompletionRate = Math.min(100, courseOverallCompletionPercentage); // 確保不超過 100%

        // Bonus 保持不變，除非有其他邏輯來更新它
        // profolio.bonus = ...;

        await profolio.save();
        return profolio;

    } catch (error) {
        console.error(`重新計算學習歷程時發生錯誤: ${error.message}`);
        throw error;
    }
};

exports.updateProfolioOnLearningProgressCompletion = async (studentId, studentModel, courseId = null) => {
    await exports.recalculateProfolio(studentId, studentModel, courseId);
    console.log(`學生 ${studentId} 的學習歷程因學習進度更新而重新計算。`);
};

exports.updateProfolioOnQuizScoreSubmission = async (studentId, studentModel, courseId = null) => {
    await exports.recalculateProfolio(studentId, studentModel, courseId);
    console.log(`學生 ${studentId} 的學習歷程因測驗成績提交而重新計算。`);
};

exports.updateProfolioBonus = async (studentId, studentModel, newBonus) => {
    try {
        let profolio = await ProfiloData.findOne({ student: studentId, studentModel: studentModel });
        if (!profolio) {
            throw new Error('找不到該學生的學習歷程記錄。無法更新 Bonus。');
        }
        profolio.bonus = newBonus;
        await profolio.save();
        return profolio;
    } catch (error) {
        console.error(`更新學生獎勵分數時發生錯誤: ${error.message}`);
        throw error;
    }
};


exports.getAllStudentsProfolioByCourse = async (courseId) => {
    try {
        // 1. 驗證課程是否存在 (可選但推薦)
        const courseExists = await CourseData.findById(courseId);
        if (!courseExists) {
            throw new Error('指定的課程 ID 不存在。');
        }

        // 2. 找出所有與該課程相關的學生
        // 這裡透過查詢所有與該課程相關的測驗分數來找出唯一的學生 ID 及其模型
        // 這會比遍歷所有 StudentUser 和 ExternalUser 然後檢查他們的參與情況更有效
        const studentScoresInCourse = await StudentQuizScore.find({}) // 查詢所有測驗分數
            .populate({ // 填充 quizId 來檢查它是否屬於這個課程
                path: 'quizId',
                select: 'course'
            })
            .select('student studentModel quizId') // 只選擇需要的欄位
            .exec();

        // 過濾出屬於該課程的測驗分數，並提取唯一的學生 ID 及其模型
        const uniqueStudentsMap = new Map(); // 使用 Map 來保持唯一性，key 為 studentId_studentModel

        for (const score of studentScoresInCourse) {
            // 確保 quizId 存在且其 course 與目標 courseId 匹配
            if (score.quizId && score.quizId.course && score.quizId.course.equals(courseId)) {
                const key = `${score.student.toString()}_${score.studentModel}`;
                if (!uniqueStudentsMap.has(key)) {
                    uniqueStudentsMap.set(key, {
                        studentId: score.student,
                        studentModel: score.studentModel
                    });
                }
            }
        }

        const allStudentsInCourse = Array.from(uniqueStudentsMap.values());
        
        const profolios = [];
        // 為每個學生獲取或重新計算他們的學習歷程
        for (const studentInfo of allStudentsInCourse) {
            try {
                // 調用現有的 getStudentProfolio 函數
                // 注意：這裡我將 getStudentProfolio 修改為接收 courseId，以便內部重新計算時可以針對性地處理。
                // 如果你的 profilio 是課程不相關的總體歷程，則可忽略 courseId 參數
                const profolio = await exports.getStudentProfolio(studentInfo.studentId, studentInfo.studentModel); // 不傳 courseId 意味計算總體歷程
                profolios.push(profolio);
            } catch (studentProfolioError) {
                console.warn(`獲取學生 ${studentInfo.studentId} (${studentInfo.studentModel}) 的學習歷程時發生錯誤，跳過該學生: ${studentProfolioError.message}`);
                // 可以選擇在這裡將錯誤信息加入到返回結果中，或者直接跳過
            }
        }

        return profolios;

    } catch (error) {
        console.error(`獲取課程 ${courseId} 下所有學生學習歷程時發生錯誤: ${error.message}`);
        throw error;
    }
};
