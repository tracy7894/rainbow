const QuizData = require('../models/QuizData');
const StudentQuizScore = require('../models/StudentQuizScore');
const CourseData=require('../models/CourseData')
exports.createQuiz = async (data) => {
    const quiz = new QuizData(data);
    return await quiz.save();
};

exports.updateQuiz = async (id, data) => {
    return await QuizData.findByIdAndUpdate(id, data, { new: true });
};

exports.getQuizById = async (id) => {
    return await QuizData.findById(id).populate('theme course');
};

exports.getQuizForStudent = async (id) => {
    const quiz = await QuizData.findById(id).lean();
    if (!quiz) return null;

    quiz.questions = quiz.questions.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest;
    });

    return quiz;
};

exports.getAllQuizzes = async () => {
    return await QuizData.find().populate('theme course');
};


exports.submitQuiz = async (submissionData) => {
    // submissionData 應該包含 { student, studentModel, quizId, answers }
    const { student, studentModel, quizId, answers } = submissionData;

    const quiz = await QuizData.findById(quizId);

    // 1. 檢查測驗或問卷是否存在
    if (!quiz) {
        throw new Error('測驗或問卷不存在。');
    }

    // --- 新增：檢查繳交期限 ---
    const currentTime = new Date();
    // 確保 quiz.timeLimit 存在且有效
    if (quiz.timeLimit && currentTime > quiz.timeLimit) {
        throw new Error('提交失敗：已超過測驗/問卷的繳交期限。');
    }
    // --- 繳交期限檢查結束 ---

    let finalScore = null; // 預設分數為 null

    // 判斷類型並處理分數
    if (quiz.type === 1) { // 測驗
        let correctCount = 0;
        // 確保 answers 是一個陣列且有內容，避免遍歷 undefined
        if (answers && Array.isArray(answers) && answers.length > 0) {
            quiz.questions.forEach((q, index) => {
                // 找到學生提交的對應問題的答案
                const submittedAnswer = answers.find(a => a.questionId.toString() === q._id.toString());

                // 檢查題目是否有正確答案 (q.correctAnswer !== null)
                // 並且學生選擇的答案 (submittedAnswer?.selectedOption) 與正確答案匹配
                if (q.correctAnswer !== null && submittedAnswer && submittedAnswer.selectedOption === q.correctAnswer) {
                    correctCount++;
                }
            });

            // 計算分數：(正確題數 / 總題數) * 100
            // 避免除以零的錯誤
            if (quiz.questions.length > 0) {
                finalScore = Math.round((correctCount / quiz.questions.length) * 100);
            } else {
                finalScore = 0; // 如果沒有題目，分數為0
            }
        } else {
            finalScore = 0; // 如果沒有提交答案，分數為0
        }

    } else if (quiz.type === 0) { // 問卷
        // 問卷設定分數為 100
        finalScore = 100;
    } else {
        throw new Error('不支援的測驗或問卷類型。');
    }

    // 檢查是否已經提交過該測驗/問卷，如果已經提交過則更新，否則創建新的
    // 這是為了滿足你 "重複 post" 的需求，即如果存在則更新，而不是每次都新建
    let existingStudentQuizScore = await StudentQuizScore.findOneAndUpdate(
        {
            student: student,
            studentModel: studentModel,
            quizId: quizId
        },
        {
            answers: answers,
            score: finalScore,
            submittedAt: new Date() // 更新提交時間
        },
        { new: true, upsert: true } // 如果找不到則創建一個新的 (upsert)
    );

    // --- 新增：提交成功後，觸發學習歷程 (Profolio) 的重新計算 ---
    if (quiz.course) {
        await profolioService.updateProfolioOnQuizScoreSubmission(student, studentModel, quiz.course);
    } else {
        // 如果 quiz 沒有 course 字段，則觸發總體學習歷程更新
        await profolioService.updateProfolioOnQuizScoreSubmission(student, studentModel);
    }
    // --- Profolio 更新觸發結束 ---

    return existingStudentQuizScore; // 返回保存或更新後的記錄
};

//查詢特定學生 (特定模型) 在特定測驗/問卷的成績
exports.getStudentQuizScoreByStudentAndQuiz = async (studentId, studentModel, quizId) => {
    try {
        const score = await StudentQuizScore.findOne({
            student: studentId,
            studentModel: studentModel,
            quizId: quizId
        })
        .populate({
            path: 'quizId', // 關聯 QuizData 模型
            select: 'title type description questions.questionText questions.options'
        })
        .populate({
            path: 'student', // 關聯 student 欄位
            model: studentModel, // 動態判斷要 populate 的模型
            select: 'name email studentId' // 根據你的 StudentUser/ExternalUser 模型調整
        })
        .exec();

        if (!score) {
            throw new Error('找不到該學生在此測驗/問卷的成績記錄。');
        }
        return score;
    } catch (error) {
        console.error(`查詢特定學生測驗成績時發生錯誤: ${error.message}`);
        throw error;
    }
};
//查詢特定學生 (特定模型) 的所有測驗與問卷成績
exports.getAllStudentQuizScoresByStudent = async (studentId, studentModel) => {
    try {
        const scores = await StudentQuizScore.find({
            student: studentId,
            studentModel: studentModel
        })
        .populate({
            path: 'quizId', // 關聯 QuizData 模型
            select: 'title type description'
        })
        .populate({
            path: 'student', // 關聯 student 欄位
            model: studentModel, // 動態判斷要 populate 的模型
            select: 'name'
        })
        .exec();

        return scores;
    } catch (error) {
        console.error(`查詢學生所有測驗成績時發生錯誤: ${error.message}`);
        throw error;
    }
};
//查詢指定課程下，指定測驗/問卷的所有同學分數
exports.getAllStudentScoresByCourseAndQuiz = async (courseId, quizId) => {
    try {
        // 1. 確認課程和測驗是否存在
        const courseExists = await CourseData.findById(courseId);
        if (!courseExists) {
            throw new Error('指定的課程 ID 不存在。');
        }
        const quiz = await QuizData.findById(quizId);
        if (!quiz) {
            throw new Error('指定的測驗或問卷 ID 不存在。');
        }
        // 確保這個 quiz 確實屬於這個 course
        if (quiz.course.toString() !== courseId.toString()) {
            throw new Error('該測驗/問卷不屬於此課程。');
        }

        const scores = await StudentQuizScore.find({ quizId: quizId })
            .populate({
                path: 'student', // 關聯學生，動態參照 studentModel
                select: 'name email studentId'
            })
            .populate({
                path: 'quizId', // 關聯 QuizData 模型
                select: 'title type'
            })
            .exec();

        return scores;
    } catch (error) {
        console.error(`查詢課程下指定測驗的所有學生分數時發生錯誤: ${error.message}`);
        throw error;
    }
};

//查詢指定課程下，所有測驗/問卷的所有同學分數
exports.getAllStudentScoresByCourse = async (courseId) => {
    try {
        // 1. 找到該課程下的所有測驗/問卷 ID
        const quizzesInCourse = await QuizData.find({ course: courseId }).select('_id');
        if (quizzesInCourse.length === 0) {
            return []; // 如果課程下沒有測驗，則返回空陣列
        }
        const quizIds = quizzesInCourse.map(quiz => quiz._id);

        // 2. 查詢這些測驗/問卷的所有學生分數
        const scores = await StudentQuizScore.find({ quizId: { $in: quizIds } })
            .populate({
                path: 'student',
                select: 'name email studentId'
            })
            .populate({
                path: 'quizId',
                select: 'title type'
            })
            .exec();

        return scores;
    } catch (error) {
        console.error(`查詢課程下所有測驗的學生分數時發生錯誤: ${error.message}`);
        throw error;
    }
};