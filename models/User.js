const mongoose = require('mongoose');
const usersSchema = require('../schemas/users');

module.exports = mongoose.model('User', usersSchema);//模型类的创建