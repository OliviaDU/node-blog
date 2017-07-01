const express = require('express');
const router = express.Router();

//用户注册
router.post('/user/register', (req, res, next) => {
    console.log(req.body);//获取post提交的数据
});

module.exports = router;