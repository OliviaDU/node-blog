const express = require('express');
const router = express.Router();
const User = require('../models/User');//引入数据模型

//统一返回格式
let responseData = {};

router.use((req, res, next) => {
    responseData = {
        code: 0,//错误码，0代表没有错误
        message: ''//错误信息
    };

    next();
});

/**
 * 用户注册路由
 */
router.post('/user/register', (req, res, next) => {
    //req.body为post提交的数据
    let username = req.body.username,
        password = req.body.password,
        repassword = req.body.repassword;

    //判断用户名是否为空
    if (username == '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);//将数据转为json格式返回给前端
        return;
    }

    //判断密码是否为空
    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    //两次输入密码是否一致
    if (repassword !== password) {
        responseData.code = 3;
        responseData.message = '两次输入密码必须一致';
        res.json(responseData);
        return;
    }

    //用户名是否已经被注册，需要查询数据库
    //返回一个promise对象
    User.findOne({
        username: username
    }, (err, doc) => {
        if (err) {
            console.log('查询出现错误');
        }
    }).then((userInfo) => {
        if (userInfo) {
            //表示数据库有该记录
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            res.json(responseData);
            return;
        }
        /**
         * 保存用户的信息到数据库
         */
        //创建用户对象，通过操作对象来操作数据库
        let user = new User({
            username: username,
            password: password
        });

        return user.save();//返回promise对象

    }).then((newUserInfo) => {
        //注册成功
        responseData.message = '注册成功';
        res.json(responseData);//将数据转为json格式返回给前端
    });

});

/**
 * 用户登录路由
 */
router.post('/user/login', (req, res) => {
    let username = req.body.username,
        password = req.body.password;

    //判断用户名或密码是否为空
    if (username == '' || password == '') {
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);//将数据转为json格式返回给前端
        return;
    }

    //查询用户名和密码是否存在，存在则登录成功
    User.findOne({
        username: username,
        password: password
    }, (err, doc) => {
        if (err) {
            console.log('查询出现错误');
        }
    }).then((userInfo) => {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);//返回数据给前端
            return;
        }
        //用户名和密码是正确的
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);//返回数据给前端
    });

});

/**
 * 用户退出路由
 */
router.get('/user/logout', (req, res) => {
    req.cookies.set('userInfo', null);
    res.json(responseData);//返回数据给前端
});

module.exports = router;