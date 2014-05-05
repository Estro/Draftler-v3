(function(SLIDER) {
    "use strict";

    SLIDER.init = function() {
        $(".owl-carousel").owlCarousel({
            lazyLoad: true,
            navigation: false,
            pagination: false,
            items: 7,
            itemsCustom: [[0, 1], [400, 2],[620, 3], [850, 4], [1000, 5], [1200, 6], [1400, 7]],
            responsiveBaseWidth: '.spotlight'
        });
    };

})(window.SLIDER = window.SLIDER || {});

$(document).ready(function() {
    if ($('.owl-carousel').length) {
        SLIDER.init();
    }
});