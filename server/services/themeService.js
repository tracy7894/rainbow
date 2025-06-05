const ThemeData = require('../data/ThemeData');

exports.createTheme = async (data) => {
    const theme = new ThemeData(data);
    return await theme.save();
};

exports.updateTheme = async (id, data) => {
    return await ThemeData.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });
};

exports.getAllThemes = async () => {
    return await ThemeData.find();
};

exports.updateThemeFocus = async (id, focus) => {
    if (!Array.isArray(focus) || focus.length !== 2) {
        throw new Error('focus 必須是包含兩個字串的陣列（[重點介紹, 學習目標]）');
    }

    const theme = await ThemeData.findByIdAndUpdate(id, { focus }, {
        new: true,
        runValidators: true
    });

    if (!theme) {
        throw new Error('找不到對應主題');
    }

    return theme;
};
exports.getThemeById = async (id) => {
    return await ThemeData.findById(id);
};