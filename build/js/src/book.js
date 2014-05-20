(function(BOOK) {
    "use strict";

    BOOK.getComments = function(chapter) {
        var url = '/api/getcomments/' + chapter,
            html,
            template = '{{#.}}<li><div class="comment-image"><a href="/profile/{{user.id}}"><img src="{{user.avatar}}" alt="{{user.username}}" title="{{user.username}}"></a></div><div class="comment">{{comment}}</div><div class="comment-meta">{{posted}}</div></li>{{/.}}';
        UTILS.getJSON(url, function(data) {
            if (data) {
                if (data.length) {
                    $.each(data, function(index, value) {
                        value.posted = moment(value.created_at).fromNow();
                    });
                    $('#comments').mCustomScrollbar("destroy");
                    $('#comments').empty();
                    html = Mustache.to_html(template, data);
                    $('#comments').html(html);
                    $('#comments').mCustomScrollbar();
                } else {
                    $('#comments').mCustomScrollbar("destroy");
                    $('#comments').empty();
                    $('#comments').html('<li>Be the first to comment!</li>');
                }
            } else {
                $('#comments').mCustomScrollbar("destroy");
                $('#comments').empty();
                $('#comments').html('<li>Be the first to comment!</li>');
            }
        });

    };

    BOOK.getAuthor = function(userId, chapter) {
        var url = '/api/getauthor/' + userId,
            html,
            template = '<li class="author a_{{id}} c_' + chapter + '" data-chapter="' + chapter + '"><div class="author-section"><div class="author-img"><img src="{{avatar}}" alt="{{username}}" /></div><span class="author-name">{{username}}</span><div><span class="points-container">Publisher Points: <span class="points">{{points}}</span></span></div></div></li>';

        UTILS.getJSON(url, function(data) {
            if (data) {
                html = Mustache.to_html(template, data);
                $('.author-details ul').append(html);
                chapter = $('.tab.active').data('chapter');
                $('.c_' + chapter).addClass('active');
            }

        });
    };

    BOOK.postComment = function() {
        var chapter = $('.tab.active').data('chapter');
        chapter = $('#chapter_' + chapter).data('id');
        var comment = $('.comment-textbox').val(),
            url = '/api/postcomment/' + chapter,
            userId = $('.current-user').data('userid'),
            avatar = $('.current-user').data('avatar'),
            username = $('.current-user').data('username'),
            posted = moment().fromNow(),
            template = '<li><div class="comment-image"><a href="/profile/' + username + '"><img src="' + avatar + '" alt="' + username + '" title="' + username + '"></a></div><div class="comment">' + comment + '</div><div class="comment-meta">' + posted + '</div></li>',
            data = {
                comment: comment
            };

        if (comment.length > 1 && comment.length < 140) {
            $("#comments .mCSB_container").append(template); //append new content inside .mCSB_container
            $("#comments").mCustomScrollbar("update"); //update scrollbar according to newly appended content
            $("#comments").mCustomScrollbar("scrollTo", "li:last", {
                scrollInertia: 1000,
                scrollEasing: "easeInOutQuad"
            });
            $('.comment-textbox').val('');
            UTILS.postJSON(url, data, function(data) {

            });
        }

    };

    BOOK.events = function() {
        var commentHeight = $('.sign-in').length ? 170 : 225;
        $('.comments, .comments ul').height($(window).height() - commentHeight);
        $('.comment-submit').click(function(e) {
            e.preventDefault();
            BOOK.postComment();
        });

        $(window).resize(function() {
            $('.comments, .comments ul').height($(window).height() - commentHeight);
        });

    };

    BOOK.displayAuthor = function() {
        var $chapters = $('.chapter'),
            author, chapter;

        $chapters.each(function(index) {
            author = $(this).data('author');
            chapter = $(this).data('chapter');
            BOOK.getAuthor(author, chapter);
        });

    };


})(window.BOOK = window.BOOK || {});

$(document).ready(function() {

    if ($('.comments').length) {
        BOOK.getComments($('.chapter').eq(0).data('id'));
    }

    if ($('.author-details').length) {
        BOOK.displayAuthor();
    }

    if ($('.book-stage').length) {
        BOOK.events();
    }

});