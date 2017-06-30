const mongoose = require('mongoose');

//用户的表结构
let Schema = mongoose.Schema;

module.exports = new Schema({
    username: String,//用户名
    password: String//密码
});