/**
 * 应用程序启动(入口)文件
 **/
const express=require('express');//express模块
const swig=require('swig');//模板处理模块
const mongoose=require('mongoose');//数据库模块
const bodyParser=require('body-parser');//中间件，处理post提交的数据

//创建app应用，等价于app.createServer();
let app=express();

app.use('/public',express.static(__dirname+'/public'));//当用户访问的url以/public开始，那么直接返回对应路径下的文件
//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数是模板文件的类型，第二个是解析处理模板的方法
app.engine('html',swig.renderFile);

app.set('views','./views');//设置模板文件存放的目录，第一个必须是‘views’

app.set('view engine','html');//注册模板引擎
swig.setDefaults({cache:false});//取消模板缓存

//bodyParser设置
app.use(bodyParser.urlencoded({extended:true}));
//根据不同功能划分模板
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));


app.get('/',(req,res,next)=>{
    res.render('index');//views/index.html
}); 

mongoose.connect('mongodb://localhost:27017/blog',(err)=>{
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        app.listen(8080);
    }
});//连接数据库
