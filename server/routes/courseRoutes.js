// routes/courseRoutes.js
//course(課程)相關api
var express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/course', courseController.createCourse);//新增課程
router.put('/course/:id', courseController.updateCourse);//修改課程
router.get('/course', courseController.getAllCourses);//查詢課程
router.get('/course/:id', courseController.getCourseById);//查詢單一課程 ByID

module.exports = router;
