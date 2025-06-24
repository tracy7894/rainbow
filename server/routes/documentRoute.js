const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 查詢
router.get('/document', documentController.getAllDocuments);
router.get('/word', documentController.getAllWords);
router.get('/scenario', documentController.getAllScenarios);

router.get('/document/:id', documentController.getDocumentById);
router.get('/word/:id', documentController.getWordById);
router.get('/scenario/:id', documentController.getScenarioById);

// 新增
router.post('/document', authMiddleware, adminMiddleware, documentController.createDocument);
router.post('/word', authMiddleware, adminMiddleware, documentController.createWord);
router.post('/scenario', authMiddleware, adminMiddleware, documentController.createScenario);

// 修改
router.put('/document/:id', authMiddleware, adminMiddleware, documentController.updateDocument);
router.put('/word/:id', authMiddleware, adminMiddleware, documentController.updateWord);
router.put('/scenario/:id', authMiddleware, adminMiddleware, documentController.updateScenario);

// 刪除
router.delete('/document/:id', authMiddleware, adminMiddleware, documentController.deleteDocument);
router.delete('/word/:id', authMiddleware, adminMiddleware, documentController.deleteWord);
router.delete('/scenario/:id', authMiddleware, adminMiddleware, documentController.deleteScenario);




module.exports = router;
