/**
 * 应用程序启动(入口)文件
 **/
const express = require('express'); //express模块
const swig = require('swig'); //模板处理模块

const mongoose = require('mongoose'); //数据库模块
mongoose.Promise = Promise;

const bodyParser = require('body-parser'); //中间件，处理post提交的数据
const Cookies = require('cookies');
const User = require('./models/User');

//创建app应用，等价于app.createServer();
let app = express();

//当用户访问的url以/public开始，那么直接返回对应路径下的文件
app.use('/public', express.static(__dirname + '/public'));

//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数是模板文件的类型，第二个是解析处理模板的方法
app.engine('html', swig.renderFile);

app.set('views', './views'); //设置模板文件存放的目录，第一个必须是‘views’

app.set('view engine', 'html'); //注册模板引擎
swig.setDefaults({ cache: false }); //取消模板缓存

//bodyParser设置,接收post提交的数据并进行处理
app.use(bodyParser.urlencoded({ extended: true }));

//设置cookie
//安装在 /user/:id 路径中的中间件函数,在路径中为任何类型的 HTTP 请求执行此函数。
app.use((req, res, next) => {
    req.cookies = new Cookies(req, res);

    //解析用户登录的cookie信息
    req.userInfo = {};
    let cookies = req.cookies.get('userInfo');

    if (cookies) {
        try {
            req.userInfo = JSON.parse(cookies);

            //获取当前登录用户类型，判断是否为管理员
            User.findById(req.userInfo._id)
                .then((userInfo) => {
                    req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                    next();
                });
        } catch (e) {
            console.log(e);
            next();
        }
    } else {
        next();
    }

});

//根据不同功能划分模板
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));

app.get('/', (req, res, next) => {
    res.render('index'); //views/index.html
});

mongoose.connect('mongodb://localhost:27017/blog', (err) => {
    if (err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        app.listen(8080);
    }
}); //连接数据库