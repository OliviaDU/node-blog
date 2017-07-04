const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Content = require('../models/Content');

const mongoose = require('mongoose');
mongoose.Promise = Promise;

router.get('/', (req, res, next) => {

    let data = {
        userInfo: req.userInfo,
        categoryID: req.query.category || '',
        categories: [],

        page: Number(req.query.page) || 1,//get方式获取page，字符串要转换为数字
        pages: 0,//总页数
        limit: 4
    };


    let where = {};
    if (data.categoryID) {
        where.category = data.categoryID;
    }
    
    //读取所有的分类信息
    Category.find().then((categories) => {
        data.categories = categories;

        //读取内容
        return Content.where(where).count();

    }).then((count) => {
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //page取值不能超过总页数
        page = Math.min(data.page, data.pages);
        //page取值不能小于1
        page = Math.max(1, data.page);

        let skip = (data.page - 1) * data.limit;


        return Content.where(where).limit(data.limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        });

    }).then((contents) => {
        data.contents = contents;

        res.render('main/index', data);
    });

});

module.exports = router;