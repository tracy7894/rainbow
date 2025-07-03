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
        let profolioSummary = await ProfiloData.findOne({ student: studentId, studentModel: studentModel })
            .populate({
                path: 'student',
                model: studentModel,
                select: 'name email studentId'
            })
            // 因為 themeCompletionRate.themeId 不再用於填充 quizzes 資訊，
            // 只需要填充主題名稱即可。
            .populate({
                path: 'themeCompletionRate.themeId',
                model: 'ThemeData',
                select: 'themeName' // 確保這裡使用正確的主題名稱字段
            })
            .exec();

        let detailedProfolio;
        if (!profolioSummary) {
            console.log(`為新學生 ${studentId} (${studentModel}) 創建並計算學習歷程數據。`);
            detailedProfolio = await exports.recalculateProfolio(studentId, studentModel, null, true);
        } else {
            detailedProfolio = await exports.recalculateProfolio(studentId, studentModel, null, false);
            // 將從數據庫獲取的 bonus 和 lastUpdated 應用到詳細結果中
            detailedProfolio.bonus = profolioSummary.bonus;
            detailedProfolio.lastUpdated = profolioSummary.lastUpdated;
            // 將 populate 的 student 資訊加入詳細結果
            detailedProfolio.student = profolioSummary.student;

            // 確保 themeCompletionRate 的 themeName 被正確地帶入
            // 因為 recalculateProfolio 不會從 profolioSummary 帶入 populated 的 themeName
            // 這邊需要手動合併 populate 過的 themeName
            detailedProfolio.themeCompletionRate = detailedProfolio.themeCompletionRate.map(item => {
                const summaryTheme = profolioSummary.themeCompletionRate.find(s => s.themeId.equals(item.themeId));
                return {
                    ...item,
                    themeName: summaryTheme && summaryTheme.themeId ? summaryTheme.themeId.themeName : item.themeName // 使用 populated 的 themeName
                };
            });
        }
        return detailedProfolio;
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
exports.recalculateProfolio = async (studentId, studentModel, courseId = null, saveToDB = false) => {
    let profolioRecord = null;
    if (saveToDB) {
        profolioRecord = await ProfiloData.findOne({ student: studentId, studentModel: studentModel });
        if (!profolioRecord) {
            profolioRecord = new ProfiloData({
                student: studentId,
                studentModel: studentModel,
                themeCompletionRate: [],
                CourseCompletionRate: 0,
                bonus: 0
            });
        }
    }

    const themeQuery = courseId ? { course: courseId } : {};
    const allThemes = await ThemeData.find(themeQuery).sort({ themeNumber: 1 });

    if (allThemes.length === 0) {
        console.warn(`沒有找到任何${courseId ? '課程下' : ''}主題，無法計算學習歷程完成率。`);
        return {
            student: studentId,
            studentModel: studentModel,
            themeCompletionRate: [],
            CourseCompletionRate: 0,
            bonus: (profolioRecord ? profolioRecord.bonus : 0),
        };
    }

    const detailedThemeCompletionRates = []; // 將包含教材完成度 + 該主題下的測驗/問卷分數
  

    let totalCourseCompletedPoints = 0;
    let totalCourseMaxPoints = 0;

    for (const theme of allThemes) {
        let currentThemeMaterialCompletedPoints = 0;
        let currentThemeMaterialMaxPoints = 0;
        let themeQuizzesDetails = []; // 儲存該主題下的測驗/問卷詳細分數（用於 detailedThemeCompletionRates）

        // --- 1. 查詢該主題下所有的教材 ID (DocumentData, WordData, ScenarioData) ---
        const docsInTheme = await DocumentData.find({ theme: theme._id }).select('_id');
        const wordsInTheme = await WordData.find({ theme: theme._id }).select('_id');
        const scenariosInTheme = await ScenarioData.find({ theme: theme._id }).select('_id');

        const allLearningItemIdsInTheme = [
            ...docsInTheme.map(d => d._id),
            ...wordsInTheme.map(w => w._id),
            ...scenariosInTheme.map(s => s._id)
        ];

        const studentLearningProgresses = await LearningProgress.find({
            student: studentId,
            studentModel: studentModel,
            item: { $in: allLearningItemIdsInTheme }
        });

        for (const itemId of allLearningItemIdsInTheme) {
            const lp = studentLearningProgresses.find(p => p.item.equals(itemId));
            currentThemeMaterialMaxPoints += MAX_SCORE_PER_ITEM;
            currentThemeMaterialCompletedPoints += (lp && lp.completed) ? MAX_SCORE_PER_ITEM : 0;

            totalCourseMaxPoints += MAX_SCORE_PER_ITEM;
            totalCourseCompletedPoints += (lp && lp.completed) ? MAX_SCORE_PER_ITEM : 0;
        }

        // --- 計算該主題的教材完成率 ---
        let themeMaterialCompletionPercentage = 0;
        if (currentThemeMaterialMaxPoints > 0) {
            themeMaterialCompletionPercentage = (currentThemeMaterialCompletedPoints / currentThemeMaterialMaxPoints) * 100;
        }

        // --- 2. 查詢該主題下所有的 QuizData ID 和詳細資訊 ---
        const quizzesInTheme = await QuizData.find({ theme: theme._id }).select('_id title type');

        const studentQuizScores = await StudentQuizScore.find({
            student: studentId,
            studentModel: studentModel,
            quizId: { $in: quizzesInTheme.map(q => q._id) }
        });

        for (const quiz of quizzesInTheme) {
            const sqs = studentQuizScores.find(s => s.quizId.equals(quiz._id));
            const score = (sqs && sqs.score !== null) ? sqs.score : 0;

            totalCourseMaxPoints += MAX_SCORE_PER_ITEM;
            totalCourseCompletedPoints += score;

            // 將測驗/問卷的詳細資訊和分數加入到 themeQuizzesDetails (用於 themeCompletionRate)
            themeQuizzesDetails.push({
                quizId: quiz._id,
                score: score,
                title: quiz.title,
                type: quiz.type
            });
        }

        // 將該主題的教材完成率和其下的測驗/問卷數據儲存到詳細的陣列中 (原有的 themeCompletionRate)
        detailedThemeCompletionRates.push({
            themeId: theme._id,
            themeName: theme.themeName,
            completionRate: Math.min(100, themeMaterialCompletionPercentage),
            quizzes: themeQuizzesDetails // 這裡仍然包含該主題下的測驗/問卷數據
        });
    }

    // --- 計算課程總完成度 (CourseCompletionRate) ---
    let courseOverallCompletionPercentage = 0;
    if (totalCourseMaxPoints > 0) {
        courseOverallCompletionPercentage = (totalCourseCompletedPoints / totalCourseMaxPoints) * 100;
    }
    courseOverallCompletionPercentage = Math.min(100, courseOverallCompletionPercentage);

    // 如果需要保存到 ProfiloData，則更新並保存
    if (saveToDB && profolioRecord) {
        profolioRecord.themeCompletionRate = detailedThemeCompletionRates.map(item => ({
            themeId: item.themeId,
            completionRate: item.completionRate
        }));
        profolioRecord.CourseCompletionRate = courseOverallCompletionPercentage;
        profolioRecord.lastUpdated = new Date();
        await profolioRecord.save();
    }

    // 返回包含所有詳細資訊的臨時對象
    return {
        student: studentId,
        studentModel: studentModel,
        themeCompletionRate: detailedThemeCompletionRates, // 包含教材完成率和該主題下的測驗/問卷分數
        CourseCompletionRate: courseOverallCompletionPercentage,
        bonus: (profolioRecord ? profolioRecord.bonus : 0),
        lastUpdated: (profolioRecord ? profolioRecord.lastUpdated : null),
    };
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
        const courseExists = await CourseData.findById(courseId);
        if (!courseExists) {
            throw new Error('指定的課程 ID 不存在。');
        }
        console.log(`[getAllStudentsProfolioByCourse Service] 接收到的 courseId: ${courseId}, 類型: ${typeof courseId}`);

        const uniqueStudentsMap = new Map();
       // const themesInCourse = await ThemeData.find({ course: '你的courseId' }).select('_id');
        const themesInCourse = await ThemeData.find({ course: courseId }).select('_id');
        const themeIds = themesInCourse.map(t => t._id);
        
        const allMaterialItems = await Promise.all([
            DocumentData.find({ theme: { $in: themeIds } }).select('_id'),
            WordData.find({ theme: { $in: themeIds } }).select('_id'),
            ScenarioData.find({ theme: { $in: themeIds } }).select('_id')
        ]);
        const allMaterialItemIds = [].concat(...allMaterialItems).map(item => item._id);

        const learningProgresses = await LearningProgress.find({
            item: { $in: allMaterialItemIds }
        }).select('student studentModel');

        for (const lp of learningProgresses) {
            const key = `${lp.student.toString()}_${lp.studentModel}`;
            if (!uniqueStudentsMap.has(key)) {
                uniqueStudentsMap.set(key, { studentId: lp.student, studentModel: lp.studentModel });
            }
        }

        const allQuizzesInCourse = await QuizData.find({ theme: { $in: themeIds } }).select('_id');
        const allQuizIdsInCourse = allQuizzesInCourse.map(q => q._id);

        const studentScores = await StudentQuizScore.find({
            quizId: { $in: allQuizIdsInCourse }
        }).select('student studentModel');

        for (const score of studentScores) {
            const key = `${score.student.toString()}_${score.studentModel}`;
            if (!uniqueStudentsMap.has(key)) {
                uniqueStudentsMap.set(key, { studentId: score.student, studentModel: score.studentModel });
            }
        }

        const allStudentsInCourse = Array.from(uniqueStudentsMap.values());

        const profolios = [];
        for (const studentInfo of allStudentsInCourse) {
            try {
                const profolio = await exports.getStudentProfolio(studentInfo.studentId, studentInfo.studentModel);
                profolios.push(profolio);
            } catch (studentProfolioError) {
                console.warn(`獲取學生 ${studentInfo.studentId} (${studentInfo.studentModel}) 的學習歷程時發生錯誤，跳過該學生: ${studentProfolioError.message}`);
            }
        }

        return profolios;

    } catch (error) {
        console.error(`獲取課程 ${courseId} 下所有學生學習歷程時發生錯誤: ${error.message}`);
        throw error;
    }
};
