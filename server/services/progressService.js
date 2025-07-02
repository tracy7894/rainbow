const mongoose = require('mongoose');
const LearningProgress = require('../models/LearningProgress');

exports.updateProgress = async ({ studentId, studentModel, itemId, itemModel }) => {
    if (!studentId || !studentModel || !itemId || !itemModel) {
        throw new Error("缺少必要欄位：studentId, studentModel, itemId, itemModel");
    }

    const StudentModel = mongoose.model(studentModel);
    const ItemModel = mongoose.model(itemModel);

    const [studentExists, itemExists] = await Promise.all([
        StudentModel.exists({ _id: studentId }),
        ItemModel.exists({ _id: itemId })
    ]);

    if (!studentExists || !itemExists) {
        throw new Error("指定的學生或教材不存在");
    }

    let progress = await LearningProgress.findOne({
        student: studentId,
        studentModel,
        item: itemId,
        itemModel
    });

    if (!progress) {
        progress = new LearningProgress({
            student: studentId,
            studentModel,
            item: itemId,
            itemModel,
            completed: true,
            completedAt: new Date()
        });
    } else {
        progress.completed = true;
        progress.completedAt = new Date();
    }

    return await progress.save();
};

exports.getStudentProgress = async ({ studentModel, studentId }) => {
    return await LearningProgress.find({
        student: studentId,
        studentModel
    }).populate('student').populate('item');
};

exports.checkItemProgress = async ({ studentModel, studentId, itemModel, itemId }) => {
    const progress = await LearningProgress.findOne({
        student: studentId,
        studentModel,
        item: itemId,
        itemModel
    }).populate('student').populate('item');

    if (!progress) return null;

    return {
        studentId,
        itemId,
        completed: progress.completed,
        completedAt: progress.completedAt
    };
};
