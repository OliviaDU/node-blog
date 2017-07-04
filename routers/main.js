const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Content = require('../models/Content');

const mongoose = require('mongoose');
mongoose.Promise = Promise;

/**
 * 中间件的方法处理通用数据
 */
let data;

router.use((req, res, next) => {
    data = {
        userInfo: req.userInfo,
        categories: [],
    };

    Category.find().then((categories) => {
        data.categories = categories;

        next();
    });

});


/**
 * 首页
 */
router.get('/', (req, res, next) => {

    Object.assign(data, {
        categoryID: req.query.category || '',

        page: Number(req.query.page) || 1,//get方式获取page，字符串要转换为数字
        pages: 0,//总页数
        limit: 4
    });

    let where = {};
    if (data.categoryID) {
        where.category = data.categoryID;
    }

    //读取所有的分类信息
    Content.where(where).count().then((count) => {
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

router.get('/view', (req, res) => {
    let contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then((content) => {
        data.content=content;

        content.views++;
        content.save();
        
        res.render('main/view',data);
    });
});

module.exports = router;