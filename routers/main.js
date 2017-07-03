const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.get('/', (req, res, next) => {
    //读取所有的分类信息
    Category.find().then((categories) => {

        res.render('main/index', {
            //分配给模板使用的数据
            userInfo: req.userInfo,
            categories:categories
        });
    });

});

module.exports = router;