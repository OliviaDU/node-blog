$(function () {
    //获取DOM元素
    $registerBox = $("#register-box");
    $loginBox = $("#login-box");
    $userInfoBox = $("#userInfo-box");

    //切换到注册面板
    $("#register-link").click(() => {
        $registerBox.show();
        $loginBox.hide();
    });

    //切换到注册面板
    $("#login-link").click(() => {
        $loginBox.show();
        $registerBox.hide();
    });

    //注册
    $("#register-btn").click(() => {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $("#inputName").val(),
                password: $("#inputPassword").val(),
                repassword: $("#confirmPassword").val()
            },
            dataType: 'json',
            success: (result) => {//result为服务器返回的数据
                $registerBox.find(".text-danger").html(result.message);
                if (!result.code) {
                    //注册成功
                    setTimeout(() => {
                        $loginBox.show();
                        $registerBox.hide();
                    }, 1000);
                }
            }
        });
        return false;
    });

    //登录
    $("#login-btn").click(() => {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $("#loginName").val(),
                password: $("#loginPassword").val()
            },
            dataType: 'json',
            success: (result) => {//result为服务器返回的数据
                $loginBox.find(".text-danger").html(result.message);
                if (!result.code) {
                    //登录成功
                    window.location.reload();
                }
            }
        });
        return false;
    });

    //退出
    $("#logout-btn").click(()=>{
        $.ajax({
            url:'/api/user/logout',
            success:(result)=>{
                if(!result.code){
                    //退出成功
                    window.location.reload();
                }
            }
        });
    });

});