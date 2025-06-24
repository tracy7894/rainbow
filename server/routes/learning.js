// learning.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const SemesterData = require('../models/SemesterData');
const CourseData = require('../models/CourseData');
const ThemeData = require('../models/ThemeData');
const DocumentData = require('../models/DocumentData');
const LearningProgress = require('../models/LearningProgress');
const ProfiloData = require('../models/ProfiloData');
const StudentUserModel = require('../models/StudentUser');
const QuizData = require('../models/QuizData')
const StudentQuizScore = require('../models/StudentQuizScore')
const WordData = require("../models/WordData")
const ScenarioData = require("../models/ScenarioData")
/**
todo 
防止重複提交api
判斷繳交期限
3mode 
quiz完成度？
作答記錄（截止日後公佈
 */



// 新增學期
// router.post('/semester', async (req, res) => {
//     try {
//         const newSemester = new SemesterData(req.body);
//         await newSemester.save();
//         res.status(201).json(newSemester);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// /**
//  * 新增單元 (Document)
//  * 接收單元資料，新增到資料庫
//  */
// router.post('/document', async (req, res) => {
//     console.log('收到 POST /document 請求');
//     try {
//         const doc = new DocumentData(req.body);
//         await doc.save();
//         res.status(201).json(doc);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });
// //新增單字
// router.post('/Word', async (req, res) => {
//     console.log('收到 POST /Word 請求');
//     try {
//         const Word = new WordData(req.body);
//         await Word.save();
//         res.status(201).json(Word);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// })
// //新增情境案例
// router.post('/Scenario', async (req, res) => {
//     console.log('收到 POST /Scenario 請求');
//     try {
//         const Scenario = new ScenarioData(req.body);
//         await Scenario.save();
//         res.status(201).json(Scenario);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// })
// /**
//  * 查詢所有單元
//  */
// router.get('/document', async (req, res) => {
//     const docs = await DocumentData.find();
//     console.log('查詢所有單元成功');
//     res.json(docs);
// });
// //查詢所有單字
// router.get('/Word', async (req, res) => {
//     const words = await WordData.find();
//     console.log('查詢所有單字成功');
//     res.json(words);
// })
// //查詢所有情境案例
// router.get('/Scenario', async (req, res) => {
//     const Scenarios = await ScenarioData.find();
//     console.log('查詢所有情應案例成功');
//     res.json(Scenarios);
// })


// // 修改單元（Document）
// router.put('/document/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedDoc = await DocumentData.findByIdAndUpdate(id, req.body, {
//             new: true, // 回傳更新後的文件
//             runValidators: true // 套用模型驗證
//         });

//         if (!updatedDoc) {
//             return res.status(404).json({ error: 'Document not found' });
//         }

//         res.json(updatedDoc);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });
// //修改單字
// router.put('/Word/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedWord = await WordData.findByIdAndUpdate(id, req.body, {
//             new: true, // 回傳更新後的文件
//             runValidators: true // 套用模型驗證
//         });

//         if (!updatedWord) {
//             return res.status(404).json({ error: 'Word not found' });
//         }

//         res.json(updatedWord);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });
// //修改情境案例
// router.put('/Scenario/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedScenario = await ScenarioData.findByIdAndUpdate(id, req.body, {
//             new: true, // 回傳更新後的文件
//             runValidators: true // 套用模型驗證
//         });

//         if (!updatedScenario) {
//             return res.status(404).json({ error: 'Scenario not found' });
//         }

//         res.json(updatedScenario);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });
// /**
//  * 查詢單一單元
//  * 根據單元 ID 查詢單一教材資料
//  */
// router.get('/document/:id', async (req, res) => {
//     try {
//         const documentId = req.params.id;
//         console.log(documentId);
//         const document = await DocumentData.findOne({ _id: documentId });
//         console.log(document);
//         if (!document) {
//             return res.status(404).json({ error: 'Document not found' });
//         }
//         res.json(document);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// });
// //查詢單一單字
// router.get('/Word/:id', async (req, res) => {
//     try {
//         const wordId = req.params.id;
//         console.log(wordId);
//         const word = await WordData.findOne({ _id: wordId });
//         console.log(word);
//         if (!word) {
//             return res.status(404).json({ error: 'Word not found' });
//         }
//         res.json(word);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// });
// //查詢單一情境案例
// router.get('/Scenario/:id', async (req, res) => {
//     try {
//         const scenarioId = req.params.id;
//         console.log(scenarioId);
//         const scenario = await ScenarioData.findOne({ _id: scenarioId });
//         console.log(scenario);
//         if (!scenario) {
//             return res.status(404).json({ error: 'Scenario not found' });
//         }
//         res.json(scenario);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// });
// //刪除單元
// router.delete('/document/:id', async (req, res) => {
//     try {
//         const result = await DocumentData.findByIdAndDelete(req.params.id);
//         if (!result) {
//             return res.status(404).json({ message: '找不到該document' });
//         }
//         res.json({ message: 'document已刪除', data: result });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });
// //刪除單字


// router.delete('/word/:id', async (req, res) => {
//     try {
//         const result = await WordData.findByIdAndDelete(req.params.id);
//         if (!result) {
//             return res.status(404).json({ message: '找不到該word' });
//         }
//         res.json({ message: 'word已刪除', data: result });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });
// //刪除情境案例
// router.delete('/scenario/:id', async (req, res) => {
//     try {
//         const result = await ScenarioData.findByIdAndDelete(req.params.id);
//         if (!result) {
//             return res.status(404).json({ message: '找不到該scenario' });
//         }
//         res.json({ message: 'scenario已刪除', data: result });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });


/**
 *新增學生學習進度
 * - 若已有記錄則更新為已完成
 * - 若沒有記錄則新增
 */
////自動判斷學生&教材類型
router.post('/progress', async (req, res) => {
    try {
        const { studentId, studentModel, itemId, itemModel } = req.body;

        if (!studentId || !studentModel || !itemId || !itemModel) {
            return res.status(400).json({ error: "缺少必要欄位：studentId, studentModel, itemId, itemModel" });
        }
        const StudentModel = mongoose.model(studentModel);
        const ItemModel = mongoose.model(itemModel);

        const studentExists = await StudentModel.exists({ _id: studentId });
        const itemExists = await ItemModel.exists({ _id: itemId });

        if (!studentExists || !itemExists) {
            return res.status(400).json({ error: "指定的學生或教材不存在" });
        }

        // 查詢是否已經有進度紀錄
        let progress = await LearningProgress.findOne({
            student: studentId,
            studentModel,
            item: itemId,
            itemModel
        });

        if (!progress) {
            // 沒有找到進度則新增
            progress = new LearningProgress({
                student: studentId,
                studentModel,
                item: itemId,
                itemModel,
                completed: true,
                completedAt: new Date()
            });
        } else {
            // 已有進度記錄，更新為完成
            progress.completed = true;
            progress.completedAt = new Date();
        }

        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * 查詢學生完成進度
 * 查詢學生已完成的單元，包含單元細節
 */
//自動判斷學生類型
router.get('/progress/:studentModel/:studentId', async (req, res) => {
    const { studentModel, studentId } = req.params;
    try {
        const result = await LearningProgress.find({
            student: studentId,
            studentModel
        }).populate('student').populate('item');

        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * 檢查單一教材是否完成
 */
//自動判斷學生&教材類型
router.get('/progress/:studentModel/:studentId/:itemModel/:itemId', async (req, res) => {
    const { studentModel, studentId, itemModel, itemId } = req.params;
    try {
        const progress = await LearningProgress.findOne({
            student: studentId,
            studentModel,
            item: itemId,
            itemModel
        }).populate('student').populate('item');

        if (!progress) {
            return res.status(404).json({ message: 'No progress record found' });
        }

        res.json({
            studentId,
            itemId,
            completed: progress.completed,
            completedAt: progress.completedAt
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * 查詢：
 * - 基本資料
 * - 學習進度
 * - 主題完成率、課程完成率、bonus
 */
router.get('/student/:studentId/status', async (req, res) => {
    try {
        const { studentId } = req.params;

        // 查學生基本資料
        const student = await StudentUserModel.findById(studentId).populate('courses semester');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // 查學生學習進度
        const progress = await LearningProgress.find({ student: studentId }).populate('DocumentData');

        // 查完成度資料
        const profiloData = await ProfiloData.findOne({ studentId: studentId });
        if (!profiloData) {
            return res.status(404).json({ error: 'ProfiloData not found' });
        }

        res.json({
            student: {
                studentId: student.studentId,
                class: student.class,
                gradeLevel: student.gradeLevel,
                courses: student.courses,
                semester: student.semester
            },
            learningProgress: progress,
            completion: {
                themeCompletionRate: profiloData.themeCompletionRate,
                courseCompletionRate: profiloData.courseCompletionRate,
                bonus: profiloData.bonus
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

/**
 * 更新 ProfiloData 的完成度
 * 依據學生已完成的單元，重新計算：
 * - 每個主題的完成率
 * - 整體課程完成率
 */
router.post('/update-completion', async (req, res) => {
    console.log('收到 POST /update-completion 請求:', req.body);
    try {
        const { studentId } = req.body;

        // 檢查 studentId
        if (!studentId) {
            return res.status(400).json({ error: 'studentId is required' });
        }
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid studentId format' });
        }

        const student = await StudentUserModel.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // 取得 ProfiloData，若無則建立新的
        let profilo = await ProfiloData.findOne({ studentId: studentId });
        if (!profilo) {
            profilo = new ProfiloData({
                studentId: studentId,
                themeCompletionRate: [],
                courseCompletionRate: 0,
                bonus: 0
            });
        }

        // 查詢學生完成的所有單元及其主題、課程關聯
        const progresses = await LearningProgress.find({
            student: studentId,
            completed: true
        }).populate({
            path: 'DocumentData',
            populate: {
                path: 'theme',
                populate: { path: 'course' }
            }
        });

        console.log('找到的進度記錄:', progresses.length);

        // 計算各主題完成率
        const themeCompletionMap = new Map();
        for (const progress of progresses) {
            const document = progress.DocumentData;
            if (!document || !document.theme || !document.theme.course) {
                console.log('跳過無效進度:', progress._id);
                continue;
            }

            const themeId = document.theme._id.toString();
            if (!themeCompletionMap.has(themeId)) {
                const themeDocs = await DocumentData.find({ theme: themeId });
                const themeProgress = await LearningProgress.find({
                    student: studentId,
                    DocumentData: { $in: themeDocs.map(d => d._id) },
                    completed: true
                });

                const completionRate = themeDocs.length ? (themeProgress.length / themeDocs.length) * 100 : 0;
                themeCompletionMap.set(themeId, { themeId, completionRate });
            }
        }

        // 更新主題完成率
        profilo.themeCompletionRate = Array.from(themeCompletionMap.values()).map(item => ({
            themeId: item.themeId,
            completionRate: item.completionRate
        }));
        console.log('主題完成度:', profilo.themeCompletionRate);

        // 計算整體課程完成率
        const courseIds = [...new Set(progresses
            .filter(p => p.DocumentData && p.DocumentData.theme && p.DocumentData.theme.course)
            .map(p => p.DocumentData.theme.course._id.toString()))];

        let totalCourseDocs = 0;
        let totalCourseProgress = 0;

        for (const courseId of courseIds) {
            const course = await CourseData.findById(courseId).populate('themes');
            if (!course || !course.themes) {
                console.log(`課程 ${courseId} 無主題`);
                continue;
            }

            const courseDocIds = await DocumentData.find({
                theme: { $in: course.themes.map(t => t._id) }
            }).distinct('_id');

            const courseProgress = await LearningProgress.find({
                student: studentId,
                DocumentData: { $in: courseDocIds },
                completed: true
            });

            totalCourseDocs += courseDocIds.length;
            totalCourseProgress += courseProgress.length;
        }

        profilo.courseCompletionRate = totalCourseDocs ? (totalCourseProgress / totalCourseDocs) * 100 : 0;
        console.log('課程完成度:', profilo.courseCompletionRate);

        await profilo.save();
        res.json({
            message: 'Completion rates updated for all themes and courses',
            ProfiloData: profilo
        });
    } catch (err) {
        console.error('POST /update-completion 錯誤:', err.message);
        res.status(400).json({ error: err.message });
    }
});


//新增quizData(問卷or測驗) 
router.post('/quiz', async (req, res) => {
    try {
        const newQuiz = new QuizData(req.body);
        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//  取得單一 Quiz by ID
router.get('/quiz/:id', async (req, res) => {
    try {
        const quiz = await QuizData.findById(req.params.id).populate('theme course');
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 取得全部 Quiz 
router.get('/quizzes', async (req, res) => {
    try {
        const quizzes = await QuizData.find().populate("theme course");
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: "無法取得測驗資料" });
    }
});
// 刪除Quiz 
// router.delete('/quiz/:id', async (req, res) => {
//     try {
//         await QuizData.findByIdAndDelete(req.params.id);
//         res.json({ message: "刪除成功" });
//     } catch (error) {
//         res.status(500).json({ error: "刪除失敗" });
//     }
// });

// 修改 Quiz
router.put('/quiz/:id', async (req, res) => {
    try {
        const updated = await QuizData.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Quiz not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 學生提交測驗 + 自動批改
router.post('/quiz/submit', async (req, res) => {
    try {
        const { student, quizId, answers } = req.body;
        const quiz = await QuizData.findById(quizId);

        if (!quiz || quiz.type !== 1) {
            return res.status(400).json({ error: '測驗不存在或非測驗類型' });
        }

        // 自動批改
        let score = 0;
        quiz.questions.forEach((q, i) => {
            if (q.correctAnswer !== null && answers[i] === q.correctAnswer) {
                score++;
            }
        });

        const result = new StudentQuizScore({ student, quizId, answers, score });
        await result.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//  查學生 Quiz 成績
router.get('/quiz-score/:studentId', async (req, res) => {
    try {
        const scores = await StudentQuizScore.find({ student: req.params.studentId }).populate('quizId');
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  修改學生成績（如需調整）
router.put('/quiz-score/:id', async (req, res) => {
    try {
        const updated = await StudentQuizScore.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: '成績不存在' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 可以隱藏答案for student  如果有需要
router.get('/quiz/:id/for-student', async (req, res) => {
    try {
        const quiz = await QuizData.findById(req.params.id).lean(); // 使用 lean() 方便修改物件
        if (!quiz) return res.status(404).json({ error: "找不到此測驗" });

        // 移除正確答案
        quiz.questions = quiz.questions.map(q => {
            const { correctAnswer, ...rest } = q;//只傳回正確答案外的資料
            return rest;
        });

        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: "獲取測驗失敗" });
    }
});


module.exports = router;
