const jwt = require('jsonwebtoken');
const Administrator = require('../models/Administrator');
require('dotenv').config();

// 驗證 JWT Token，支援從 Cookie 取得 Token
exports.authMiddleware = async (req, res, next) => {
    try {
        // **從 Cookie 取得 Token**
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: '未授權，請提供 Token' });
        }

        // **驗證 Token**
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 儲存解碼後的使用者資訊
        next();
    } catch (error) {
        return res.status(403).json({ message: '無效的 Token' });
    }
};

// 限制只有管理員能訪問
exports.adminMiddleware = async (req, res, next) => {
    try {
        const user = await Administrator.findById(req.user.userId);
        if (!user || user.identity !== 3) { // 3 = 管理員
            return res.status(403).json({ message: '權限不足' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: '伺服器錯誤' });
    }
};