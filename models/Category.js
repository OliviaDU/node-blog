const mongoose = require('mongoose');
const categoriesSchema = require('../schemas/categories');

module.exports = mongoose.model('Category', categoriesSchema);//模型类的创建