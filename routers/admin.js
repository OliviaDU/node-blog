const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
                
                count:count,
                page: page,
                limit:limit,
                pages:pages
            });
        });

    });


});

module.exports = router;