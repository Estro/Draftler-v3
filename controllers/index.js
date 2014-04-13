

exports.home = function(req, res) {
    res.render('index/home');
}


exports.userHome = function(req, res) {
    res.render('index/home', {loggedIn : true});
}
