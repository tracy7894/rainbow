const DocumentData = require('../models/DocumentData');
const WordData = require('../models/WordData');
const ScenarioData = require('../models/ScenarioData');

// 新增
exports.createDocument = (data) => new DocumentData(data).save();
exports.createWord = (data) => new WordData(data).save();
exports.createScenario = (data) => new ScenarioData(data).save();

// 查詢全部
exports.getAllDocuments = () => DocumentData.find();
exports.getAllWords = () => WordData.find();
exports.getAllScenarios = () => ScenarioData.find();

// 查詢單一
exports.getDocumentById = (id) => DocumentData.findById(id);
exports.getWordById = (id) => WordData.findById(id);
exports.getScenarioById = (id) => ScenarioData.findById(id);

// 更新
exports.updateDocument = (id, data) => DocumentData.findByIdAndUpdate(id, data, { new: true, runValidators: true });
exports.updateWord = (id, data) => WordData.findByIdAndUpdate(id, data, { new: true, runValidators: true });
exports.updateScenario = (id, data) => ScenarioData.findByIdAndUpdate(id, data, { new: true, runValidators: true });

// 刪除
exports.deleteDocument = (id) => DocumentData.findByIdAndDelete(id);
exports.deleteWord = (id) => WordData.findByIdAndDelete(id);
exports.deleteScenario = (id) => ScenarioData.findByIdAndDelete(id);
