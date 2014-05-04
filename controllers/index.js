var content = require('../content/english');

exports.home = function(req, res) {
    res.redirect('/Explore');
}


exports.userHome = function(req, res) {
    res.render('index/home', {
        loggedIn: true,
        is_admin: req.user.attributes.is_admin,
        emailConfirmed: req.user.attributes.email_confirmed,
        username: req.user.attributes.username,
        frame: content.frame.ui
    });
}