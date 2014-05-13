(function(BOOK) {
    "use strict";

    BOOK.getComments = function(chapter) {
        var url = '/api/getcomments/' + chapter,
            html,
            template = '{{#.}}<li><div class="comment-image"><a href="/profile/{{user.id}}"><img src="{{user.avatar}}" alt="{{user.username}}" title="{{user.username}}"></a></div><div class="comment">{{comment}}</div><div class="comment-meta">{{posted}}</div></li>{{/.}}';
        UTILS.getJSON(url, function(data) {
            if (data) {
                $.each(data, function(index, value) {
                    value.posted = moment(value.created_at).fromNow();

                });

                html = Mustache.to_html(template, data);
                $('.comments ul').html(html);
            }

        });

    };

    BOOK.getAuthor = function(userId) {
        var url = '/api/getauthor/' + userId,
            html,
            template = '<li class="author a_{{id}}"><div class="author-section"><div class="author-img"><img src="{{avatar}}" alt="{{username}}" /></div><span class="author-name">{{username}}</span><div><span class="points-container">Publisher Points: <span class="points">{{points}}</span></span></div></div></li>';
        
        UTILS.getJSON(url, function(data) {
            if (data) {
                html = Mustache.to_html(template, data);
                $('.author-details ul').append(html);
            }

        });

    };


})(window.BOOK = window.BOOK || {});

$(document).ready(function() {

    if ($('.comments').length) {
        BOOK.getComments($('.chapter').eq(0).data('id'));
    }

    if ($('.author-details').length) {
        BOOK.getAuthor($('.chapter').eq(0).data('author'));
    }

});