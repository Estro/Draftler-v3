(function(PROFILE) {
    "use strict";

    PROFILE.setFollow = function() {
        var userid = $('.user-profile-dashboard').data('userid');
        if (userid) {
            $.get('/api/followstatus/' + userid, function(data) {
                if (data && data.status) {
                    if (data.status === "Not following") {
                        $('.user-actions a').text('Follow');
                    } else {
                        $('.user-actions a').text('Un-Follow');
                    }
                }
            });

            $('.user-actions a').click(function(e) {
                e.preventDefault();
                var text = $(this).text();
                if (text === 'Follow') {
                    $.post('/api/follow/' + userid, function(data) {
                        $('.user-actions a').text('Un-Follow');
                    });

                } else {
                    $.post('/api/unfollow/' + userid, function(data) {
                        $('.user-actions a').text('Follow');
                    });
                }
            });
        }
    };


    PROFILE.getActivity = function() {
        var userid = $('.user-profile-dashboard').data('userid'),
            url, html, username, template = '{{#.}}<li><div class="the-date"><span>{{day}}</span><small>{{month}}</small></div>{{{title}}}</li>{{/.}}';

        if (userid) {
            url = '/api/getuseractivity/' + userid;
            $.getJSON(url, function(data) {
                if (data.length) {
                    $.each(data, function(index, value) {
                        value.day = moment(value.completedAt).format('DD');
                        value.month = moment(value.completedAt).format('MMM');

                        if (value.message_id == 10) {
                            value.title = '<h4>' + value.message + '</h4>';
                        } else {
                            value.title = '<h4>' + value.message + '</h4>';
                        }

                    });

                    html = Mustache.to_html(template, data);
                    $('.the-timeline ul').html(html);
                    $('.the-timeline .pre-loader').hide();
                    if ($('.the-timeline li').length < 2) {
                        $('.the-timeline ul').css({
                            borderLeft: '0px solid white'
                        });
                    }
                }


            });
        }
    };

    PROFILE.postComment = function() {
        var html, template = '<li><div class="the-date"><span>{{day}}</span><small>{{month}}</small></div><h4>{{message}}</h4></li>';
        $('#comment-submit').click(function(event) {
            event.preventDefault();

            var message = $('textarea[name=comment]').val(),
                formData = {
                    'message': message
                };

            if (message.length > 0) {
                var day = moment().format('DD'),
                    month = moment().format('MMM');

                $.ajax({
                    type: 'POST',
                    url: '/api/useractivity',
                    data: formData,
                    dataType: 'json',
                    encode: true
                })
                    .done(function(data) {
                        $('textarea[name=comment]').val('');
                        formData.day = day;
                        formData.month = month;
                        html = Mustache.to_html(template, formData);
                        $('.the-timeline ul').prepend(html);
                    });
            }
        });


    };

    PROFILE.commentLoader = function() {
        var didScroll = false,
            url, page = 1,
            html, incompleted = true,
            userid = $('.user-profile-dashboard').data('userid'),
            template = '{{#.}}<li><div class="the-date"><span>{{day}}</span><small>{{month}}</small></div>{{{title}}}</li>{{/.}}';

        $(window).scroll(function() {
            didScroll = true;
        });

        setInterval(function() {
            if (didScroll && incompleted) {
                didScroll = false;
                if ($(window).scrollTop() + $(window).height() > $(document).height() - 50) {
                    url = '/api/getuseractivity/' + userid + '/' + page;
                    $('.the-timeline .pre-loader').show();
                    $.getJSON(url, function(data) {
                        page++;
                        if (data.length) {
                            $.each(data, function(index, value) {
                                value.day = moment(value.completedAt).format('DD');
                                value.month = moment(value.completedAt).format('MMM');

                                if (value.message_id == 10) {
                                    value.title = '<h4>' + value.message + '</h4>';
                                } else {
                                    value.title = '<h4>' + value.message + '</h4>';
                                }

                            });

                            html = Mustache.to_html(template, data);
                            $('.the-timeline ul').append(html);
                            $('.the-timeline .pre-loader').hide();
                        } else {
                            incompleted = false;
                            $('.the-timeline .pre-loader').hide();
                        }
                    });
                }

            }
        }, 250);
    };


    PROFILE.imageUploader = function() {

        $('#profile-image-form-btn').click(function(event) {
            event.preventDefault();
            var data;
            $('#profile-image-form').hide();
            $('.image-loader').show();
            data = new FormData();
            data.append('file', $('#image-input')[0].files[0]);

            $.ajax({
                type: 'POST',
                url: '/api/profileimage',
                data: data,
                processData: false,
                cache: false,
                contentType: false
            })
                .done(function(data) {
                    if (data) {
                        $('#profile-image-form').show();
                        $('.image-loader').hide();
                        $('.user-image img').attr('src', data);
                        $('#profile-modal').modal('hide');
                    }
                });

        });


    };



})(window.PROFILE = window.PROFILE || {});

$(document).ready(function() {
    if ($('.user-actions').length) {
        PROFILE.setFollow();
    }

    if ($('.user-feed').length) {
        PROFILE.getActivity();
        PROFILE.commentLoader();
        PROFILE.imageUploader();
    }

    if ($('.post-to-timeline').length) {
        PROFILE.postComment();
    }

});