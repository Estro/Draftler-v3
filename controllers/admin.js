var data = require('../models/auth')(),
    utils = require('../util/utils'),
    moment = require('moment'),
    content = require('../content/english'),
    sanitizer = require('sanitizer');

// route: admin/manage-users
// redirects to page one of manage users.
exports.homePage = function(req, res) {
    res.redirect('admin/manage-users/1');
};

// route: admin/manage-users/:page
// Get count of users then render user details for given page
exports.manageUsers = function(req, res) {
    var page = utils.cleanNum(req.params.page),
        offset, nextPage, lastPage, i, itemsPerPage = 20;

    if (page) {
        // need to use knex to get count. 
        data.knex('user').count('id as cnt').then(function(count) {

            // calcuate offset and construct date for next/prev buttons
            page = parseInt(page);
            offset = (page - 1) * itemsPerPage;
            nextPage = page + 1;
            lastPage = page == 1 ? false : (page - 1);

            // if no more records, set no next page
            if (page * itemsPerPage > count[0].cnt) {
                nextPage = false;
            }

            // get collections of users
            new data.users().query(function(qb) {
                qb.limit(itemsPerPage).offset(offset).orderBy('username', 'DESC');
            }).fetch().then(function(data) {
                // if we get results
                if (data && data.models) {
                    for (i = 0, l = data.models.length; i < l; i++) {
                        data.models[i].attributes.created_at = moment(data.models[i].attributes.created_at).fromNow();
                        data.models[i].attributes.updated_at = moment(data.models[i].attributes.updated_at).fromNow();
                    }

                    if (data.models.length < 1) {
                        res.redirect('admin/manage-users/' + lastPage);
                    }
                    // render page with content and user stats
                    res.render('admin/manage-users', {
                        loggedIn: true,
                        is_admin: true,
                        models: data.models,
                        content: content.admin.ui,
                        frame: content.frame.ui,
                        nextPage: nextPage,
                        lastPage: lastPage,
                        error: req.flash('a-error'),
                        messages: req.flash('a-info'),
                        validation: content.validation
                    });
                } else {
                    // just redirect on errors. simples.
                    res.redirect('admin/manage-users/1');
                }
            }, function(err) {
                res.redirect('admin/manage-users/1');
            });
        }, function(err) {
            res.redirect('admin/manage-users/1');
        });
    } else {
        res.redirect('admin/manage-users/1');
    }
};

// route: /admin/edit-user/:id
// Check user exists and render page with user details
exports.editUser = function(req, res) {
    var userId = utils.cleanNum(req.params.id);
    if (userId) {
        new data.user('id', userId).fetch().then(function(data) {
            if (data && data.attributes) {
                res.render('admin/edit-user', {
                    loggedIn: true,
                    is_admin: true,
                    models: data.attributes,
                    error: req.flash('a-error'),
                    messages: req.flash('a-info'),
                    content: content.admin.ui,
                    frame: content.frame.ui,
                    validation: content.validation
                });
            } else {
                req.flash('a-error', content.admin.messages.cantGetUsers);
                res.redirect('admin/manage-users');
            }
        }, function(err) {
            req.flash('a-error', content.admin.messages.cantGetUsers);
            res.redirect('admin/manage-users');
        });
    } else {
        res.redirect('admin/manage-users');
    }
};

// route: post /admin/edit-user
// validate user and update user profile details
exports.updateUser = function(req, res) {
    var userId = utils.cleanNum(req.body.userId),
        username = sanitizer.sanitize(req.body.username.trim()),
        firstname = sanitizer.sanitize(req.body.firstname.trim()),
        surname = sanitizer.sanitize(req.body.surname.trim()),
        email = sanitizer.sanitize(eq.body.email.trim()),
        email_confirmed = req.body.emailconfirmed,
        active = sanitizer.sanitize(req.body.active),
        verified = sanitizer.sanitize(req.body.verified),
        admin = sanitizer.sanitize(req.body.admin),
        banned = sanitizer.sanitize(req.body.banned);

    // switch checkbox values to bool.
    active = active === 'on' ? 1 : 0;
    admin = admin === 'on' ? 1 : 0;
    verified = verified === 'on' ? 1 : 0;
    email_confirmed = email_confirmed === 'on' ? 1 : 0;
    banned = banned === 'on' ? 1 : 0;

    if (userId && username.length && email.length) {
        // save user details.
        new data.user({
            id: userId
        }).save({
            email_confirmed: email_confirmed,
            username: username,
            first_name: firstname,
            last_name: surname,
            email: email,
            is_active: active,
            is_verified: verified,
            is_admin: admin,
            is_banned: banned
        }).then(function(data) {
            req.flash('a-info', content.admin.messages.profileUpdated);
            res.redirect('/admin/edit-user/' + userId);
            return;
        }, function() {
            req.flash('a-error', content.admin.messages.updateFailed);
            res.redirect('/admin/edit-user/' + userId);
        });
    } else {
        res.redirect('admin/manage-users');
    }
};