(function(NAV) {
    "use strict";

    NAV.setActive = function() {
        var pathName = window.location.pathname.toLowerCase(),
            section = pathName.split("/")[1],
            $tabItem = false,
            $menuItem = false,
            tabLink;

        //Set active class to left hand bar items
        $('.tab').each(function(index) {
            $tabItem = $(this).find('a').attr('href');

            if ($tabItem && ($tabItem.toLowerCase() === pathName)) {
                $(this).addClass('active');
            }
        });

        // Set Active class for top nav bar
        $('.nav li').each(function() {
            $menuItem = $(this).find('a').attr('href').toLowerCase().replace('/', '');
            if ($menuItem === section) {
                $(this).addClass('active');
            }
        });


    };


})(window.NAV = window.NAV || {});

$(document).ready(function() {
    NAV.setActive();

});