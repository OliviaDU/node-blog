/**
 * 内容的表结构
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
    //分类信息，关联字段-内容分类的id
    category: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Content'
    },

    //内容标题
    title: String,

    //简介
    abstract: {
        type: String,
        default: ''
    },

    //内容
    content: {
        type: String,
        default: ''
    }
});