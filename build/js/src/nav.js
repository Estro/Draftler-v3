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

        NAV.bookNavFit = function() {
            var $bookMenu = $('.book-menu'),
                topMaker = $('.detail-container').offset().top - 60,
                $window = $(window),
                didScroll = false,
                scrollpos, chapter, elepos, author, notAuto = true;

            $bookMenu.height($('.content-stage').height());

            $(window).scroll(function() {
                scrollpos = $(document).scrollTop();
                if ($window.scrollTop() >= topMaker) {
                    $bookMenu.addClass('sticky');
                } else {
                    $bookMenu.removeClass('sticky');
                }

                $('.chapter').each(function() {
                    elepos = $(this).offset().top;

                    if ((elepos - 200) < scrollpos && notAuto) {
                        chapter = $(this).attr('data-chapter');
                        author = $(this).attr('data-author');
                        $('.tab, .author').removeClass('active');
                        $("*[data-chapter='" + chapter + "']").addClass('active');
                    }
                });
            });

            $bookMenu.find('.tab').eq(0).addClass('active');

            $bookMenu.find('.tab').click(function(e) {
                notAuto = false;
                e.preventDefault();
                chapter = $(this).attr('data-chapter');
                $('.tab, .author').removeClass('active');
                $("*[data-chapter='" + chapter + "']").addClass('active');
                $("html, body").animate({
                    scrollTop: $('#chapter_' + chapter).position().top
                }, function() {
                    notAuto = true;
                });
            });

        };

    };


})(window.NAV = window.NAV || {});

$(document).ready(function() {
    NAV.setActive();

    if ($('.book-menu').length) {
        NAV.bookNavFit();
    }
});