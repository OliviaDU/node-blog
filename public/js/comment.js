/**
 * 每次刷新页面获取一次评论
 */
let comments = [];

$.ajax({
    type: 'GET',
    url: '/api/comment',
    data: {
        contentid: $('#content-id').val(),
    },
    success: (res) => {
        comments = res.data.comments;
        renderComment();
    }
});

// 评论分页
let page = 1;

//运用事件委托为a标签绑定事件
$('.pager').delegate('a', 'click', function() {
    if ($(this).parent().hasClass('previous')) {
        --page;
    } else {
        ++page;
    }
    renderComment();
});

/**
 * 提交评论
 */
$('#comment-btn').click(() => {
    $.ajax({
        type: 'POST',

        //发送请求的地址
        url: '/api/comment/post',

        //提交的数据
        data: {
            contentid: $('#content-id').val(),
            content: $('#comment-textarea').val()
        },

        //提交成功后，res为后端返回的数据
        success: (res) => {
            $('#comment-textarea').val('');
            comments = res.data.comments;
            renderComment();
        }
    });
});

/**
 * 渲染评论
 */
function renderComment() {
    //评论分页
    let len = comments.length; //评论总数
    if (!len) {
        $('.pager').html('<p>还没有评论</p>');
    } else {
        let limit = 8, //每页显示评论数
            pages = Math.ceil(len / limit), //评论总页数

            start = (page - 1) * limit,
            end = start + limit;

        $lis = $('.pager li');
        $lis.eq(1).html(`<strong>${page}/${pages}</strong>`);

        if (page <= 1) {
            page = 1;
            $lis.eq(0).html('<span>没有上一页了</span>');
        } else {
            $lis.eq(0).html('<a href="#" >上一页</a>');
        }

        if (page >= pages) {
            page = pages;
            $lis.eq(2).html('<span>没有下一页了</span>');
        } else {
            $lis.eq(2).html('<a href="#">下一页</a>');
        }

        //按照时间倒序展示评论
        let html = '';
        comments = comments.reverse();

        comments.slice(start, end).forEach((comment) => {
            // 评论内容模板
            //comment.content = parse(comment.content);
            let commentContent = `
            <div class="comment-title">
                <hr>
                <strong class="pull-left">${comment.username}</strong>
                <span class="pull-right">${formData(comment.postTime)}</span>
            </div>
            <p>${comment.content}</p>`; //p内的内容默认按照HTML进行解析，而不是text

            html += commentContent;
        });

        $('.comment-content').html(html);
    }

    $('#comment-count').html(`共 ${len} 条评论`);

}

/**
 * 格式化时间
 */
function formData(time) {
    let date = new Date(time);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}