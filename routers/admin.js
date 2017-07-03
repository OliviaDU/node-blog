const express = require('express');
const router = express.Router();

//引入数据库模型
const User = require('../models/User');
const Category = require('../models/Category');

//路由器层中间件
router.use((req, res, next) => {
    if (!req.userInfo.isAdmin) {
        //如果当前用户不是管理员
        res.send('对不起，只有管理员才可以进入后台管理');
        return;
    }
    next();//如果当前中间件函数没有结束请求/响应循环，那么它必须调用 next()，将控制权传递给下一个中间件函数。否则，请求将保持挂起状态。
});

/**
 * 首页
 */
router.get('/', (req, res, next) => {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

/**
 * 用户管理
 */
router.get('/user', (req, res) => {
    /**
     * 从数据库中读取用户数据
     * limit(number)：限制获取的数据条数
     * skip(number)：忽略数据的条数
     * 每页显示两条
     * 1：1-2 skip：0 =>当前页数-1 *limit
     * 2：3-4 skip：2
    **/
    let page = Number(req.query.page) || 1,//get方式获取page，字符串要转换为数字
        pages = 0,
        limit = 2;

    User.count().then((count) => {

        //计算总页数，总条数=count
        pages = Math.ceil(count / limit);
        //page取值不能超过总页数
        page = Math.min(page, pages);
        //page取值不能小于1
        page = Math.max(1, page);

        let skip = (page - 1) * limit;

        User.find().limit(limit).skip(skip).then((users) => {
            res.render('admin/user_index', {
                //后端数据传递给前端模板
                userInfo: req.userInfo,
                users: users,

                count: count,
                page: page,
                limit: limit,
                pages: pages
            });
        });

    });

});

/**
 * 分类首页
 */
router.get('/category', (req, res) => {
    /**
     * 从数据库中读取用户数据
     * limit(number)：限制获取的数据条数
     * skip(number)：忽略数据的条数
     * 每页显示两条
     * 1：1-2 skip：0 =>当前页数-1 *limit
     * 2：3-4 skip：2
    **/
    let page = Number(req.query.page) || 1,//get方式获取page，字符串要转换为数字
        pages = 0,
        limit = 2;

    Category.count().then((count) => {

        //计算总页数，总条数=count
        pages = Math.ceil(count / limit);
        //page取值不能超过总页数
        page = Math.min(page, pages);
        //page取值不能小于1
        page = Math.max(1, page);

        let skip = (page - 1) * limit;

        Category.find().limit(limit).skip(skip).then((categories) => {
            res.render('admin/category_index', {
                //后端数据传递给前端模板
                userInfo: req.userInfo,
                categories: categories,

                count: count,
                page: page,
                limit: limit,
                pages: pages
            });
        });

    });
});

/**
 * 添加分类
 */
router.get('/category/add', (req, res) => {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});

/**
 * 分类保存
 */
router.post('/category/add', (req, res) => {
    //req.body为post提交的数据
    let name = req.body.name || '';

    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            errMessage: '名称不能为空'
        });
        return;
    }

    //数据库中是否存在同名的分类名称
    Category.findOne({ name: name }).then((rs) => {
        if (rs) {
            //数据库中已经存在该分类
            res.render('admin/error', {
                userInfo: req.userInfo,
                errMessage: '分类已经存在'
            });
            return Promise.reject();
        } else {
            //数据库中不存在该分类，可以保存
            return new Category({
                name: name
            }).save((newCategory) => {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    errMessage: '创建分类成功',
                    url: '/admin/category'
                });
            });
        }
    });

});

/**
 * 分类修改
 */
router.get('/category/edit', (req, res) => {
    //获取要修改的分类信息，并以表单形式展现出来
    let id = req.query.id || '';

    //获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then((category) => {

        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                errMessage: '分类信息不存在'
            });
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        }

    });

});

/**
 * 分类的修改保存
 */
router.post('/category/edit', (req, res) => {
    //获取要修改的分类信息，并以表单形式展现出来
    let id = req.query.id || '';

    //获取post提交过来的名称
    let name = req.body.name || '';

    //获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then((category) => {

        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                errMessage: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            //当用户没有做任何修改提交的时候,视为修改成功
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    errMessage: '修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                //当用户做了修改，需要判断修改后的分类名称是否存在于数据库中
                return Category.findOne({
                    //id不等于当前所修改类目的id，但name相等
                    _id: { $ne: id },
                    name: name
                });
            }
        }

    }).then((sameCategory) => {
        //如果存在同名分类名称
        if (sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                errMessage: '已存在同名分类'
            });
            return Promise.reject();
        } else {
            //否则更新数据库
            return Category.update({
                _id: id
            }, { name: name });
        }
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            errMessage: '修改成功',
            url: '/admin/category'
        });
    });

});

/**
 * 分类删除
 */
router.get('/category/delete',(req,res)=>{
    //获取要修改的分类信息，并以表单形式展现出来
    let id = req.query.id || '';

    Category.remove({
        _id:id
    }).then(()=>{
        res.render('admin/success', {
            userInfo: req.userInfo,
            errMessage: '删除成功',
            url: '/admin/category'
        });
    });
});

module.exports = router;