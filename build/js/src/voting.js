(function(VOTING) {
    "use strict";

    VOTING.slider = function() {
        var chapter, author, url, voteText, removeText, $that, book = $('.book-stage').data('bookid');
        $(".voting").owlCarousel({
            navigation: false,
            pagination: false,
            singleItem: true,
            addClassActive: true,
            afterMove: function() {
                chapter = $('.owl-item.active').find('.voting-chapter').data('id');
                author = $('.owl-item.active').find('.voting-chapter').data('author');

                if ($('.a_' + author).length) {
                    $('.author').removeClass('active');
                    $('.a_' + author).eq(0).addClass('active');
                } else {
                    BOOK.getAuthor(author, chapter, true);
                }
                if (chapter) {
                    BOOK.getComments(chapter);
                }
            }
        });

        url = '/api/submitvote/' + book;
        UTILS.getJSON(url, function(data) {
            if (data.chapter) {
                $('.vc-' + data.chapter.toString()).find('.vote-btn').text('Remove Vote').show();
            } else {
                $('.vote-btn').show();
            }
        });

        $('.directions .fa-arrow-right').click(function() {
            var slider = $(this).parent().parent().find('.owl-carousel').data('owlCarousel');
            slider.next();
        });

        $('.directions .fa-arrow-left').click(function() {
            var slider = $(this).parent().parent().find('.owl-carousel').data('owlCarousel');
            slider.prev();
        });

        $('.vote-btn').click(function() {
            $that = $(this);
            chapter = $('.owl-item.active').find('.voting-chapter').data('id');
            voteText = $that.data('votetext');
            removeText = $that.data('remove');
            if ($that.text() === removeText) {
                url = '/api/deletevote/' + chapter;
                UTILS.postJSON(url, {}, function(data) {
                    if (data) {
                        $that.text(voteText);
                        $('.vote-btn').show();
                    }
                });
            } else {
                $('#vote-modal').modal('toggle');
            }
        });

        $('.vote-confirm').click(function() {
            chapter = $('.owl-item.active').find('.voting-chapter').data('id');
            url = '/api/chaptervote/' + book + '/' + chapter;
            $('#vote-modal').modal('toggle');
            UTILS.postJSON(url, {}, function(data) {
                $that.text(removeText);
            });

        });

    };

})(window.VOTING = window.VOTING || {});

$(document).ready(function() {
    if ($('.voting').length) {
        VOTING.slider();
    }
});