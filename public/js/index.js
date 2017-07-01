$(function(){
    //切换到注册面板
    $("#register-link").click(()=>{
        $("#register-box").show();
        $("#login-box").hide();
    });

     //切换到注册面板
    $("#login-link").click(()=>{
        $("#login-box").show();
        $("#register-box").hide();
    });

    //注册
    $("#register-btn").click(()=>{
        //通过ajax提交请求
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username:$("#inputName").val(),
                password:$("#inputPassword").val(),
                repassword:$("#confirmPassword").val()
            },
            dataType:'json',
            success:(result)=>{
                console.log(result);
            }
        });
        return false;
    });
});