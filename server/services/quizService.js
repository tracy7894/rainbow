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
    const { student, studentModel, quizId, answers } = submissionData;

    const quiz = await QuizData.findById(quizId);

    // 1. 檢查測驗或問卷是否存在
    if (!quiz) {
        throw new Error('測驗或問卷不存在。');
    }

    // --- 新增：檢查繳交期限 ---
    const currentTime = new Date();
    if (quiz.timeLimit && currentTime > quiz.timeLimit) {
        throw new Error('提交失敗：已超過測驗/問卷的繳交期限。');
    }
    // --- 繳交期限檢查結束 ---

    // --- 新增：防止重複提交邏輯 ---
    // 查詢學生是否已經提交過該測驗/問卷
    const existingSubmission = await StudentQuizScore.findOne({
        student: student,
        studentModel: studentModel,
        quizId: quizId
    });

    if (existingSubmission) {
        // 如果已經存在提交記錄
        // 對於測驗 (quiz.type === 1)，通常只允許提交一次，所以直接阻止再次提交
        if (quiz.type === 1) { // 測驗
            throw new Error('您已完成此測驗，無法重複提交成績。');
        } else if (quiz.type === 0) { // 問卷
            // 對於問卷 (quiz.type === 0)，如果允許重新填寫，可以讓它繼續更新
            // 如果問卷也只允許提交一次，則可以改為 throw new Error('您已提交此問卷。');
            console.log(`學生 ${student} 已提交過問卷 ${quizId}，將更新其記錄。`);
            // 這裡可以選擇更新或阻止。若要完全阻止，則在此處 throw error。
            // 由於你之前需求是 "重複 post"，所以對於問卷我們讓它更新。
        }
    }
    // --- 防止重複提交邏輯結束 ---

    let finalScore = null;

    // 判斷類型並處理分數
    if (quiz.type === 1) { // 測驗
        let correctCount = 0;
        if (answers && Array.isArray(answers) && answers.length > 0) {
            quiz.questions.forEach((q, index) => {
                const submittedAnswer = answers.find(a => a.questionId.toString() === q._id.toString());
                if (q.correctAnswer !== null && submittedAnswer && submittedAnswer.selectedOption === q.correctAnswer) {
                    correctCount++;
                }
            });
            if (quiz.questions.length > 0) {
                finalScore = Math.round((correctCount / quiz.questions.length) * 100);
            } else {
                finalScore = 0;
            }
        } else {
            finalScore = 0;
        }
    } else if (quiz.type === 0) { // 問卷
        finalScore = 100; // 問卷設定分數為 100
    } else {
        throw new Error('不支援的測驗或問卷類型。');
    }

    let savedStudentQuizScore;
    if (existingSubmission && quiz.type === 0) { // 如果是問卷且已存在，則更新
        existingSubmission.answers = answers;
        existingSubmission.score = finalScore;
        existingSubmission.submittedAt = new Date();
        savedStudentQuizScore = await existingSubmission.save();
    } else { // 如果是測驗 (type 1) 且不存在，或者問卷但不存在，則創建新記錄
        const newStudentQuizScore = new StudentQuizScore({
            student: student,
            studentModel: studentModel,
            quizId: quizId,
            answers: answers,
            score: finalScore,
            submittedAt: new Date()
        });
        savedStudentQuizScore = await newStudentQuizScore.save();
    }

    // --- 提交成功後，觸發學習歷程 (Profolio) 的重新計算 ---
    if (quiz.course) {
        await profolioService.updateProfolioOnQuizScoreSubmission(student, studentModel, quiz.course);
    } else {
        await profolioService.updateProfolioOnQuizScoreSubmission(student, studentModel);
    }
    // --- Profolio 更新觸發結束 ---

    return savedStudentQuizScore;
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