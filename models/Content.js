const mongoose = require('mongoose');
const contentsSchema = require('../schemas/contents');

module.exports = mongoose.model('Content', contentsSchema);//模型类的创建