exports.generateToken = function(len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};


exports.composeConfimrationEmail = function(id, token, name) {
    var link = 'localhost/3000/emailconfirmation/' + id + '/' + token;
    var html = "<html><body>";
    html += "Hi " + name + ",<br><br>";
    html += "<a href='" + link + "'>Please click here to confirm your email address</a><br><br>";
    html += "Cheers,<br>";
    html += "</body></html>";
    return [{
        data: html,
        alternative: true
    }];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}