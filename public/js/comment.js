/**
 * 每次刷新页面获取一次评论
 */
$.ajax({
    type: 'GET',
    url: '/api/comment',
    data: {
        contentid: $('#content-id').val(),
    },
    success: (res) => {
        renderComment(res.data.comments);
    }
});

/**
 * 提交评论
 */
$('#comment-btn').click(() => {
    $.ajax({
        type: 'POST',
        url: '/api/comment/post',//发送请求的地址
        data: {
            contentid: $('#content-id').val(),
            content: $('#comment-textarea').val()
        },//提交的数据
        success: (res) => {
            $('#comment-textarea').val('');
            renderComment(res.data.comments);
        }//提交成功后，res为后端返回的数据
    });
});

/**
 * 渲染评论
 */
function renderComment(comments) {

    let html = '';

    //按照时间倒序展示评论
    comments.reverse().forEach((comment) => {
        // 评论内容模板
        let commentContent = `
            <div class="comment-title">
                <hr>
                <strong class="pull-left">${comment.username}</strong>
                <span class="pull-right">${formData(comment.postTime)}</span>
            </div>
            <p>${comment.content}</p>`;

        html += commentContent;
    });

    $('.comment-content').html(html);

    $('#comment-count').html(`共 ${comments.length} 条评论`);
}

/**
 * 格式化时间
 */
function formData(time) {
    let date = new Date(time);
    return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}