// routes/courseRoutes.js
//course(課程)相關api
var express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/course', courseController.createCourse);
router.put('/course/:id', courseController.updateCourse);
router.get('/course', courseController.getAllCourses);
router.get('/course/:id', courseController.getCourseById);

module.exports = router;
