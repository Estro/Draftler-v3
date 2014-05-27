(function(VOTING) {
    "use strict";

    VOTING.slider = function() {
        $(".voting").owlCarousel({
            navigation: false,
            pagination: false,
            singleItem:true,
            addClassActive:true
        });

    };

})(window.VOTING = window.VOTING || {});

$(document).ready(function() {
    if ($('.voting').length) {
        VOTING.slider();
    }
});