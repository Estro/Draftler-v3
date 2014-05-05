(function(RATING) {
    "use strict";

    RATING.showRating = function() {
        var score, stars, i;
        $('.rating').each(function() {
            score = $(this).data('score');
            stars = $(this).find('i');
            if (score) {
                for (i = 0; i < score; i++) {
                    stars.eq(i).removeClass('fa-star-o').addClass('fa-star');
                }
            }

        });

    };

})(window.RATING = window.RATING || {});

$(document).ready(function() {
    if ($('.book').length) {
        RATING.showRating();
    }
});