/**
 * 分类的表结构
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
    //分类名称
    name: String
});