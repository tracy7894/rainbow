const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const postController = require('../controllers/postController');
//const { authMiddleware, adminMiddleware } = require('../middleware/auth');
//留言相關
// 新增留言（需登入）
router.post('/discussion', authMiddleware, discussionController.createDiscussion);

// 修改留言（只能修改自己的）
router.put('/discussion/:id', authMiddleware, discussionController.updateDiscussion);

// 刪除留言（需為管理員）
router.delete('/discussion/:id', authMiddleware, adminMiddleware, discussionController.deleteDiscussion);

// 查詢所有留言
router.get('/discussion', discussionController.getAllDiscussions);

// 根據 ID 查詢單一留言
router.get('/discussion/:id', discussionController.getDiscussionById);

//貼文相關（僅限管理員）
//新增貼文
router.post('/post', postController.createPost);

//修改貼文
router.put('/post/:id', postController.updatePost);

//刪除貼文
router.delete('/post/:id', authMiddleware, adminMiddleware, postController.deletePost);

//取得貼文
router.get('/post', authMiddleware, adminMiddleware, postController.getAllPosts);

//取得單一貼文
router.get('/post/:id', authMiddleware, adminMiddleware, postController.getPostById);

module.exports = router;
