var indexController = require('./controllers/index'),
    loginController = require('./controllers/login'),
    apiController = require('./controllers/api');

module.exports = function(app, passport) {

    // Home
    app.get('/', ensureAuthenticated, indexController.home);
    app.get('/home', ensureAuthenticated, indexController.userHome);


    app.get('/emailconfirmation/:id/:token', loginController.confirmEmail);

    // Auth
    app.get('/register', loginController.registerPage);
    app.post('/register', loginController.registerPost);
    app.get('/forgot', loginController.forgotten);
    app.get('/login', loginController.loginPage);
    app.post('/login', loginController.checkLogin);
    app.get('/logout', loginController.logout);
    app.get('/resendemail', loginController.resendEmail);


    // Public facing APIS

    app.get('/api/usernames/:username', apiController.checkUsername);


    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    }

    function ensureAdmin(req, res, next) {
        if (req.user && req.user.admin === true)
            return next();
        else
            res.redirect('/login');
    };

}