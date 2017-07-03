const mongoose = require('mongoose');

//分类的表结构
let Schema = mongoose.Schema;

module.exports = new Schema({
    //分类名称
    name: String
});