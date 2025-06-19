const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// 新增留言
router.post('/discussion', isAuthenticated, discussionController.createDiscussion);

// 修改留言（只能修改自己的）
router.put('/discussion/:id', isAuthenticated, discussionController.updateDiscussion);

// 管理員刪除留言（可刪所有人的） 先驗證是否登入在驗證是否為admin
router.delete('/discussion/:id', isAuthenticated, isAdmin, discussionController.deleteDiscussion);

// 查詢所有留言
router.get('/', discussionController.getAllDiscussions);

// 根據 ID 查詢單一留言
router.get('/:id', discussionController.getDiscussionById);
ㄥ
module.exports = router;