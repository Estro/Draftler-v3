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

    UTILS.postJSON = function (url,data,returnFunction){
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: 'json',
            success: function(data) {
                returnFunction(data);
            },
            error: function() {

            }
        });
    };




})(window.UTILS = window.UTILS || {});