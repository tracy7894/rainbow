const courseService = require('../services/courseService');

exports.createCourse = async (req, res) => {
    try {
        const course = await courseService.createCourse(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await courseService.updateCourse(id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await courseService.getAllCourses();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
