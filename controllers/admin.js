var data = require('../models/auth')(),
    utils = require('../util/utils'),
    moment = require('moment'),
    content = require('../content/english');

exports.homePage = function(req, res) {
    res.redirect('admin/manage-users');
}

exports.manageUsers = function(req, res) {
    new data.users().fetch().then(function(data) {
        if (data && data.models) {
            for (var i = 0, l = data.models.length; i < l; i++) {
                data.models[i].attributes.createdAt = moment(data.models[i].attributes.createdAt).fromNow();
                data.models[i].attributes.updatedAt = moment(data.models[i].attributes.updatedAt).fromNow();
            }
            res.render('admin/manage-users', {
                loggedIn: true,
                isAdmin: true,
                models: data.models,
                content: content.admin.ui,
                frame: content.frame.ui
            });
        } else {
            res.redirect('admin/manage-users');
        }
    }, function() {
        res.redirect('admin/manage-users');
    });
}

exports.editUser = function(req, res) {
    var userID = req.params.id;
    new data.ApiUser('id', userID).fetch().then(function(data) {
        if (data && data.attributes) {
            res.render('admin/edit-user', {
                loggedIn: true,
                isAdmin: true,
                models: data.attributes,
                error: req.flash('error'),
                messages: req.flash('info'),
                content: content.admin.ui,
                frame: content.frame.ui
            });
        } else {
            res.redirect('admin/manage-users');
        }
    }, function(err) {
        res.redirect('admin/manage-users');
    });
}

exports.updateUser = function(req, res) {
    var id = req.body.userid,
        username = req.body.username,
        firstname = req.body.firstname,
        surname = req.body.surname,
        email = req.body.email,
        email_confirmed = req.body.emailconfirmed,
        active = req.body.active,
        verified = req.body.verified,
        admin = req.body.admin,
        banned = req.body.banned;

    active = active === 'on' ? 1 : 0;
    admin = admin === 'on' ? 1 : 0;
    verified = verified === 'on' ? 1 : 0;
    email_confirmed = email_confirmed === 'on' ? 1 : 0;
    banned = banned === 'on' ? 1 : 0;

    new data.ApiUser({
        id: id
    }).save({
        email_confirmed: email_confirmed,
        username: username,
        first_name: firstname,
        last_name: surname,
        email: email,
        isActive: active,
        isVerified: verified,
        isAdmin: admin,
        isBanned: banned
    }).then(function(data) {
        req.flash('info', content.admin.messages.profileUpdated);
        res.redirect('/admin/edit-user/' + id);
        return;
    }, function() {
        req.flash('info', content.admin.messages.updateFailed);
        res.redirect('/admin/edit-user/' + id);
    });
}