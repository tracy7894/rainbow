const CourseData = require('../models/CourseData');

exports.createCourse = async (data) => {
    const course = new CourseData(data);
    return await course.save();
};

exports.updateCourse = async (id, data) => {
    return await CourseData.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });
};

exports.getAllCourses = async () => {
    return await CourseData.find();
};

exports.getCourseById = async (id) => {
    return await CourseData.findById(id);
};
