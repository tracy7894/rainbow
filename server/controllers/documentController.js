const documentService = require('../services/documentService');

exports.createDocument = async (req, res) => {
    try {
        const result = await documentService.createDocument(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.createWord = async (req, res) => {
    try {
        const result = await documentService.createWord(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.createScenario = async (req, res) => {
    try {
        const result = await documentService.createScenario(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllDocuments = async (req, res) => {
    const data = await documentService.getAllDocuments();
    res.json(data);
};

exports.getAllWords = async (req, res) => {
    const data = await documentService.getAllWords();
    res.json(data);
};

exports.getAllScenarios = async (req, res) => {
    const data = await documentService.getAllScenarios();
    res.json(data);
};

exports.getDocumentById = async (req, res) => {
    const result = await documentService.getDocumentById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Document not found' });
    res.json(result);
};

exports.getWordById = async (req, res) => {
    const result = await documentService.getWordById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Word not found' });
    res.json(result);
};

exports.getScenarioById = async (req, res) => {
    const result = await documentService.getScenarioById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Scenario not found' });
    res.json(result);
};

exports.updateDocument = async (req, res) => {
    try {
        const result = await documentService.updateDocument(req.params.id, req.body);
        if (!result) return res.status(404).json({ error: 'Document not found' });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateWord = async (req, res) => {
    try {
        const result = await documentService.updateWord(req.params.id, req.body);
        if (!result) return res.status(404).json({ error: 'Word not found' });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateScenario = async (req, res) => {
    try {
        const result = await documentService.updateScenario(req.params.id, req.body);
        if (!result) return res.status(404).json({ error: 'Scenario not found' });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteDocument = async (req, res) => {
    const result = await documentService.deleteDocument(req.params.id);
    if (!result) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document deleted', data: result });
};

exports.deleteWord = async (req, res) => {
    const result = await documentService.deleteWord(req.params.id);
    if (!result) return res.status(404).json({ error: 'Word not found' });
    res.json({ message: 'Word deleted', data: result });
};

exports.deleteScenario = async (req, res) => {
    const result = await documentService.deleteScenario(req.params.id);
    if (!result) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ message: 'Scenario deleted', data: result });
};
