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
                scrollpos, chapter, elepos, author, notAuto = true,
                liveChapter = 0,
                first = true,
                repeater = 0,
                $ele;

            $bookMenu.height($('.content-stage').height());

            $(window).scroll(function() {
                scrollpos = $(document).scrollTop();
                if ($window.scrollTop() >= topMaker) {
                    $bookMenu.addClass('sticky');
                } else {
                    $bookMenu.removeClass('sticky');
                }

                $('.chapter').each(function() {
                    elepos = $(this).offset().top - 200;
                    if (elepos < scrollpos && notAuto && scrollpos < (elepos + 400)) {
                     
                            if ($(this).attr('data-chapter') != liveChapter) {
                                    $('.tab, .author, .chapter').removeClass('active');
                                    liveChapter = $(this).attr('data-chapter');
                                    author = $(this).attr('data-author');
                                    $("*[data-chapter='" + liveChapter + "']").addClass('active');
                                    chapter = $('.chapter.active').data('id');
                                    BOOK.getComments(chapter);
                            }
                    }
                });

        
                    elepos = $('.voting-chapter').eq(0).offset().top - 200;
                    if (elepos < scrollpos && notAuto && scrollpos < (elepos + 400)) {
                            var $liveItem = $('.owl-item.active').children();
                            if ($liveItem.attr('data-chapter') != liveChapter) {
                                    $('.tab, .author, .chapter').removeClass('active');
                                    liveChapter = $liveItem.attr('data-chapter');
                                    console.log(liveChapter);
                                    author = $liveItem.attr('data-author');
                                    $("*[data-chapter='" + liveChapter + "']").addClass('active');
                                    chapter = $('.chapter.active').data('id');
                                    BOOK.getComments(chapter);
                                }
                    }
            
            });

            $bookMenu.find('.tab').eq(0).addClass('active');

            $bookMenu.find('.tab').click(function(e) {
                notAuto = false;
                e.preventDefault();
                chapter = $(this).attr('data-chapter');
                $('.tab, .author').removeClass('active');
                $("*[data-chapter='" + chapter + "']").addClass('active');
                $("*[data-voting-chapter='" + chapter + "']").addClass('active');
                liveChapter = chapter;
                chapter = $('.chapter.active').data('id');
                BOOK.getComments(chapter);
                if ($(this).hasClass('voting-tab')) {
                    $ele = $('.voting-chapter').eq(0);
                } else {
                    $ele = $('#chapter_' + liveChapter);
                }
                $("html, body").animate({
                    scrollTop: $('#chapter_' + liveChapter).position().top
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