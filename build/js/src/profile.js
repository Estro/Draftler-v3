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

    


})(window.PROFILE = window.PROFILE || {});

$(document).ready(function() {
    if ($('.user-actions').length) {
        PROFILE.setFollow();
    }
});