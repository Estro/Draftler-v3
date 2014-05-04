(function(FORMS) {
    "use strict";

    FORMS.regs = {
        email: /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/,
    };

    FORMS.getRegex = function(inputType) {
        var reg;
        switch (inputType) {
            case "email":
                reg = FORMS.regs.email;
                break;
            default:
                reg = false;
                break;
        }
        return reg;
    };

    FORMS.setClass = function($element, valid) {
        var $parent = $element.parent();
        if (valid) {
            $parent.removeClass('has-error').addClass('has-success');
            //$errorMessage.hide();
        } else {
            $parent.removeClass('has-success').addClass('has-error');
            //$errorMessage.show();
        }
    };

    FORMS.setMessage = function($element, valid) {
        var $errorMessage = $element.parent().parent().find('.error-message'),
            $parent = $element.parent();
        if (valid) {
            $errorMessage.hide();
            $parent.removeClass('has-error').removeClass('has-success');
        } else {
            $errorMessage.show();
        }
    };

    FORMS.validate = function($element) {
        var value, valid;

        $element.keyup(function() {
            value = $(this).val();
            if (value.length) {
                valid = true;
            } else {
                valid = false;
            }
            FORMS.setClass($(this), valid);

        });

        $element.blur(function() {
            value = $(this).val();
            if (value.length) {
                valid = true;
            } else {
                valid = false;
            }
            FORMS.setMessage($(this), valid);

        });

    };

    FORMS.validateRegex = function($element) {
        var value, valid, regex = FORMS.getRegex($element.data('validate'));

        $element.keyup(function() {
            value = $(this).val();
            if (value.length && regex.test(value)) {
                valid = true;
            } else {
                valid = false;
            }
            FORMS.setClass($(this), valid);
        });

        $element.blur(function() {
            value = $(this).val();
            if (value.length && regex.test(value)) {
                valid = true;
            } else {
                valid = false;
            }
            FORMS.setMessage($(this), valid);

        });

    };

    FORMS.ajax = function($element) {
        var api = $element.data('validate-ajax'),
            url, value, valid;

        if (api === 'username') {
            $element.keyup(function() {
                value = $(this).val();
                url = '/api/usernames/' + value;
                if (value.length < 3) {
                    valid = false;
                    FORMS.setClass($element, valid);
                } else {
                    //$element.parent().find('.fa').removeClass('fa-user').addClass('fa-spinner fa-spin');
                    UTILS.getJSON(url, function(data) {
                        //$element.parent().find('.fa').removeClass('fa-spinner fa-spin').addClass('fa-user');
                        if (data.username === "taken") {
                            valid = false;
                        } else {
                            valid = true;
                        }
                        FORMS.setClass($element, valid);
                    });
                }
            });

            $element.blur(function() {
                value = $(this).val();
                url = '/api/usernames/' + value;
                if (value.length < 3) {
                    valid = false;
                    FORMS.setMessage($element, valid);
                } else {
                   //$element.parent().find('fa').removeClass('fa-user').addClass('fa-spinner').addClass('fa-spin');
                    UTILS.getJSON(url, function(data) {
                       // $element.parent().find('fa').removeClass('fa-spin').removeClass('fa-spin').addClass('fa-user');
                        if (data.username === "taken") {
                            valid = false;
                        } else {
                            valid = true;
                        }
                        FORMS.setMessage($element, valid);
                    });
                }
            });

        }

    };

    FORMS.match = function($element) {
        var matchValue = $element.data('validate-match'),
            $matchField = $('input[name=' + matchValue + ']'),
            value, thisValue, valid;

        if ($matchField) {

            $element.keyup(function() {
                value = $matchField.val();
                thisValue = $element.val();

                if (value.length && thisValue.length && value === thisValue) {
                    valid = true;
                } else {
                    valid = false;
                }
                FORMS.setClass($(this), valid);
            });

            $element.blur(function() {
                value = $matchField.val();
                thisValue = $element.val();

                if (value.length && thisValue.length && value === thisValue) {
                    valid = true;
                } else {
                    valid = false;
                }
                FORMS.setMessage($(this), valid);

            });

        }

    };

    FORMS.init = function() {
        var $elements = $("input,select,textarea").not("[type=submit]");

        $elements.each(function() {

            if ($(this).data('validate')) {
                if ($(this).data('validate') === 'value') {
                    FORMS.validate($(this));
                } else {
                    FORMS.validateRegex($(this));
                }
            }

            if ($(this).data('validate-match')) {
                FORMS.match($(this));
            }

            if ($(this).data('validate-ajax')) {
                FORMS.ajax($(this));
            }
            $('form').submit(function() {
                if ($('.has-error').length) {
                    return false;
                } else {
                    return true;
                }
            });

        });


    };


})(window.FORMS = window.FORMS || {});

$(document).ready(function() {

    if ($('form').length) {
        FORMS.init();
    }

});