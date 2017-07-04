const express = require('express');
const router = express.Router();

//引入数据库模型
const User = require('../models/User');
const Category = require('../models/Category');
const Content = require('../models/Content');

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
        limit = 6;

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
                pages: pages,
                url:'/admin/user'
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
        limit = 6;

    Category.count().then((count) => {

        //计算总页数，总条数=count
        pages = Math.ceil(count / limit);
        //page取值不能超过总页数
        page = Math.min(page, pages);
        //page取值不能小于1
        page = Math.max(1, page);

        let skip = (page - 1) * limit;

        /**
         * 默认生成的_id是包含时间戳的
         * 1：升序
         * -1：降序，由大到小
         */
        Category.find().sort({ _id: -1 }).limit(limit).skip(skip).then((categories) => {
            res.render('admin/category_index', {
                //后端数据传递给前端模板
                userInfo: req.userInfo,
                categories: categories,

                count: count,
                page: page,
                limit: limit,
                pages: pages,
                url:'/admin/category'
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
            message: '名称不能为空'
        });
        return;
    }

    //数据库中是否存在同名的分类名称
    Category.findOne({ name: name }).then((rs) => {
        if (rs) {
            //数据库中已经存在该分类
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在'
            });
            return Promise.reject();
        } else {
            //数据库中不存在该分类，可以保存
            return new Category({
                name: name
            }).save((newCategory) => {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '创建分类成功',
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
                message: '分类信息不存在'
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
                message: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            //当用户没有做任何修改提交的时候,视为修改成功
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
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
                message: '已存在同名分类'
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
            message: '修改成功',
            url: '/admin/category'
        });
    });

});

/**
 * 分类删除
 */
router.get('/category/delete', (req, res) => {
    //获取要修改的分类信息，并以表单形式展现出来
    let id = req.query.id || '';

    Category.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        });
    });
});

/**
 * 内容首页
 */
router.get('/content', (req, res) => {
    let page = Number(req.query.page) || 1,//get方式获取page，字符串要转换为数字
        pages = 0,//总页数
        limit = 6;

    Content.count().then((count) => {

        //计算总页数，总条数=count
        pages = Math.ceil(count / limit);
        //page取值不能超过总页数
        page = Math.min(page, pages);
        //page取值不能小于1
        page = Math.max(1, page);

        let skip = (page - 1) * limit;

        //关联查询populate
        Content.find().sort({ _id: -1 }).limit(limit).skip(skip).populate(['category','user']).sort({
            addTime: -1
        }).then((contents) => {
            res.render('admin/content_index', {
                //后端数据传递给前端模板
                userInfo: req.userInfo,
                contents: contents,

                count: count,
                page: page,
                limit: limit,
                pages: pages,
                url:'/admin/content'
            });
        });

    });
});
/**
 * 内容添加首页
 */
router.get('/content/add', (req, res) => {
    //从数据库中读取分类信息
    Category.find().then((categories) => {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        });
    });

});

/**
 * 内容的保存
 */
router.post('/content/add', (req, res) => {
    if (!req.body.category) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }

    if (!req.body.title) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题不能为空'
        });
        return;
    }

    //保存数据到数据库
    let data = {
        category: req.body.category,
        title: req.body.title,
        user:req.userInfo._id.toString(),
        abstract: req.body.abstract,
        content: req.body.content
    };
    let Blog = new Content(data);

    Blog.save(data, (err) => {
        console.log(err);
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url:'/admin/content'
        });
    });

});

/**
 * 内容修改
 */
router.get('/content/edit', (req, res) => {
    //获取要修改的分类信息
    let id = req.query.id || '',
        categories = [];

    //查找分类信息
    Category.find().then((rs) => {
        categories = rs;

        //查找内容信息并返回
        return Content.findOne({
            _id: id
        }).populate('category');

    }).then((content) => {

        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            });
        }

    });
});

/**
 * 内容的修改保存
 */
router.post('/content/edit', (req, res) => {
    //获取要修改的分类信息，并以表单形式展现出来
    let id = req.query.id || '';

    if (!req.body.category) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }

    if (!req.body.title) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题不能为空'
        });
        return;
    }

    Content.update({
        _id: id
    }, {
            category: req.body.category,
            title: req.body.title,
            abstract: req.body.abstract,
            content: req.body.content
        }).then(() => {
            res.render('admin/success', {
                userInfo: req.userInfo,
                message: '内容修改成功',
                url:'/admin/content'
            });
        });
});

/**
 * 内容的删除
 */
router.get('/content/delete', (req, res) => {
    //获取要修改的分类信息，并以表单形式展现出来
    let id = req.query.id || '';

    Content.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        });
    });
});


module.exports = router;