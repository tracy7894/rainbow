//learning.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const CourseData = require('../data/CourseData');
const ThemeData = require('../data/ThemeData');
const DocumentData = require('../data/DocumentData');
const LearningProgress = require('../data/LearningProgress');
const ProfiloData = require('../data/ProfiloData');
const StudentUserModel = require('../data/StudentUser');
router.post('/course', async (req, res) => {
    try {
        const course = new CourseData(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2️⃣ 查詢所有課程
router.get('/course', async (req, res) => {
    // process.stdout.write("A")
    const courses = await CourseData.find();
    res.json(courses);
});

// 3️⃣ 查詢課程細節（含主題與單元）
router.get('/course/:id', async (req, res) => {
    const course = await CourseData.findById(req.params.id)
        .populate({
            path: 'themes',
            populate: { path: 'documents' }
        });
    res.json(course);
});

// 4️⃣ 新增主題
router.post('/theme', async (req, res) => {

    try {
        const theme = new ThemeData(req.body);
        await theme.save();
        res.status(201).json(theme);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 5️⃣ 查詢所有主題
router.get('/theme', async (req, res) => {
    const themes = await ThemeData.find();
    res.json(themes);
});

// 6️⃣ 新增單元（Document）
router.post('/document', async (req, res) => {
    console.log('收到 POST /document 請求');
    try {
        const doc = new DocumentData(req.body);
        await doc.save();
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 7️⃣ 查詢所有單元
router.get('/document', async (req, res) => {
    const docs = await DocumentData.find();
    console.log('aaaaa')
    res.json(docs);
});
//findone 
router.get('/document/:id', async (req, res) => {
    try {
        const documentId = req.params.id
        console.log(documentId)
        const document = await DocumentData.findOne({ _id: documentId });
        console.log(document)
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json(document);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message });
    }
});



// 8️⃣ 新增學生學習進度
router.post('/progress', async (req, res) => {
    try {
        const { studentId, documentId } = req.body;
        let progress = await LearningProgress.findOne({ student: studentId, DocumentData: documentId });

        if (!progress) {
            progress = new LearningProgress({
                student: studentId,
                DocumentData: documentId,
                completed: true,
                completedAt: new Date()
            });
        } else {
            progress.completed = true;
            progress.completedAt = new Date();
        }

        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 9️⃣ 查詢學生完成進度
router.get('/progress/:studentId', async (req, res) => {
    try {
        const result = await LearningProgress.find({ student: req.params.studentId }).populate('DocumentData');
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🔟 檢查教材是否完成 error
router.get('/progress/:studentId/:documentId', async (req, res) => {
    try {
        const { studentId, documentId } = req.params;
        const progress = await LearningProgress.findOne({
            student: studentId,
            DocumentData: documentId
        }).populate('DocumentData');

        if (!progress) {
            return res.status(404).json({ message: 'No progress record found' });
        }

        res.json({
            studentId,
            documentId,
            completed: progress.completed,
            completedAt: progress.completedAt
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 1️⃣1️⃣ 查詢學生所有狀態（更新以支持多主題完成度）
router.get('/student/:studentId/status', async (req, res) => {
    try {
        const { studentId } = req.params;

        // 查詢學生資訊
        const student = await StudentUserModel.findById(studentId).populate('courses semester');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // 查詢學習進度
        const progress = await LearningProgress.find({ student: studentId }).populate('DocumentData');

        // 查詢完成度
        const profiloData = await ProfiloData.findOne({ studentId: studentId });
        if (!profiloData) {
            return res.status(404).json({ error: 'ProfiloData data not found' });
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
                themeCompletionRate: profiloData.themeCompletionRate, // 返回多主題完成度陣列
                courseCompletionRate: profiloData.courseCompletionRate,
                bonus: profiloData.bonus
            }
        });
    } catch (err) {
        console.error(err); // 建議加個 log
        res.status(400).json({ error: err.message });
    }
});


// 1️⃣2️⃣ 更新 ProfiloData完成度（支持多主題）error
router.post('/update-completion', async (req, res) => {
    console.log('收到 POST /update-completion 請求:', req.body);
    try {
        const { studentId } = req.body;
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
        let profilo = await ProfiloData.findOne({ studentId: studentId });
        if (!profilo) {
            profilo = new ProfiloData({
                studentId: studentId,
                themeCompletionRate: [],
                courseCompletionRate: 0,
                bonus: 0
            });
        }
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
        console.log('找到的進度記錄:', progresses.length, progresses.map(p => ({
            _id: p._id,
            DocumentData: p.DocumentData ? p.DocumentData._id : null,
            theme: p.DocumentData && p.DocumentData.theme ? p.DocumentData.theme._id : null,
            course: p.DocumentData && p.DocumentData.theme && p.DocumentData.theme.course ? p.DocumentData.theme.course._id : null
        })));
        const themeCompletionMap = new Map();
        for (const progress of progresses) {
            const document = progress.DocumentData;
            if (!document || !document.theme || !document.theme.course) {
                console.log('跳過無效進度:', progress._id, {
                    hasDocument: !!document,
                    hasTheme: document && !!document.theme,
                    hasCourse: document && document.theme && !!document.theme.course
                });
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
                console.log(`主題 ${themeId} 計算:`, {
                    themeDocs: themeDocs.length,
                    themeProgress: themeProgress.length
                });
                const completionRate = themeDocs.length ? (themeProgress.length / themeDocs.length) * 100 : 0;
                themeCompletionMap.set(themeId, { themeId, completionRate });
            }
        }
        ProfiloData.themeCompletionRate = Array.from(themeCompletionMap.values()).map(item => ({
            themeId: item.themeId,
            completionRate: item.completionRate
        }));
        console.log('主題完成度:', ProfiloData.themeCompletionRate);
        const courseIds = [...new Set(progresses
            .filter(p => p.DocumentData && p.DocumentData.theme && p.DocumentData.theme.course)
            .map(p => p.DocumentData.theme.course._id.toString()))];
        console.log('找到的課程 ID:', courseIds);
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
            console.log(`課程 ${courseId} 計算:`, {
                courseDocs: courseDocIds.length,
                courseProgress: courseProgress.length
            });
            totalCourseDocs += courseDocIds.length;
            totalCourseProgress += courseProgress.length;
        }
        ProfiloData.courseCompletionRate = totalCourseDocs ? (totalCourseProgress / totalCourseDocs) * 100 : 0;
        console.log('課程完成度:', ProfiloData.courseCompletionRate, {
            totalCourseDocs,
            totalCourseProgress
        });
        await profilo.save();
        res.json({
            message: 'Completion rates updated for all themes and courses',
            ProfiloData
        });
    } catch (err) {
        console.error('POST /update-completion 錯誤:', err.message);
        res.status(400).json({ error: err.message });
    }
});


module.exports = router;
