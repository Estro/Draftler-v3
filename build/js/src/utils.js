(function(UTILS) {
    "use strict";

    UTILS.getJSON = function(url, returnFunction) {
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            success: function(data) {
                returnFunction(data);
            },
            error: function() {

            }
        });
    };




})(window.UTILS = window.UTILS || {});