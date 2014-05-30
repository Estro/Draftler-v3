(function(LOGIN) {
    "use strict";


    LOGIN.forms = {
        validationLogOnForm: function() {
            // $('#input-login-username').keyup(function() {
            //     var value = $(this).val();
            //     if (value.length > 4) {
            //         $('.form-username-icon .fa').removeClass().addClass('fa fa-spinner');
            //         LOGIN.forms.checkUsername(value.toLowerCase());
            //     } else {
            //         $('.form-username-icon').removeClass('success').removeClass('fail');
            //         $('.form-username-icon .fa').removeClass().addClass('fa fa-envelope');
            //     }
            // }); //fa fa-spinner

        },
        checkUsername: function(username) {
            var url = '/api/usernames/' + username;
            UTILS.getJSON(url, function(data) {
                if (data.username === "Taken") {
                    $('.form-username-icon').removeClass('success').addClass('fail');
                    $('.form-username-icon .fa').removeClass().addClass('fa fa-frown-o');
                } else {
                    $('.form-username-icon').removeClass('fail').addClass('success');
                    $('.form-username-icon .fa').removeClass().addClass('fa fa-smile-o');
                }
            });



        }

    };


})(window.LOGIN = window.LOGIN || {});

$(document).ready(function() {



});