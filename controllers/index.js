exports.home = function(req, res) {
    res.redirect('/Explore');
}


exports.userHome = function(req, res) {
    res.render('index/home', {
        loggedIn: true,
        isAdmin: req.user.attributes.isAdmin,
        emailConfirmed: req.user.attributes.email_confirmed,
        username: req.user.attributes.username
    });
}