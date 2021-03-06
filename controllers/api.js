var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    content = require('../content/english'),
    cloudinary = require('cloudinary'),
    config = require('../config.js'),
    sanitizer = require('sanitizer');

// set up cloudinary for profile image webservice
cloudinary.config(config.development.cloudinary);

// Used by sign up for to check for unique usernames.
// returns available/taken, 404 on error
exports.checkUsername = function(req, res, next) {
    var username = sanitizer.sanitize(req.params.username);
    if (username.length) {
        new data.user({
            username: username
        }).fetch().then(function(user) {
            if (user) {
                res.send({
                    username: 'taken'
                });
            } else {
                res.send({
                    username: 'available'
                });
            }
        }, function(err) {
            // give away no info from errors!
            res.send(404);
        });
    } else {
        res.send(404);
    }
};


// Used by user profiles
// Checks if current user is following another memeber
exports.followStatus = function(req, res, next) {
    var username = sanitizer.sanitize(req.params.userId);
    if (username.length) {
        new data.follower().query(function(qb) {
            qb.where({
                user_id: req.user.id,
                follows_id: username
            });
        }).fetch().then(function(follower) {
            if (follower) {
                res.send({
                    status: 'Following'
                });
            } else {
                res.send({
                    status: 'Not following'
                });
            }
        }, function(err) {
            // give away no info from errors!
            res.send(404);
        });
    } else {
        res.send(404);
    }
};

// Used by user profiles
// Saves a following relationship between current user and another member
exports.followUser = function(req, res, next) {
    var userId = utils.cleanNum(req.params.userId);
    if (userId) {
        new data.user({
            id: userId
        }).fetch().then(function(user) {
            if (user) {
                var follow = new data.follower().query(function(qb) {
                    qb.where({
                        user_id: req.user.id,
                        follows_id: userId
                    });
                });

                follow.fetch().then(function(follower) {
                    if (follower) {
                        res.send({
                            status: 'Already following'
                        });
                    } else {
                        follow.save({
                            user_id: req.user.id,
                            follows_id: userId

                        }).then(function() {
                            res.send({
                                status: 'successful'
                            });
                        }, function(err) {
                            // give away no info from errors!
                            res.send(404);
                        });
                    }
                }, function(err) {
                    // give away no info from errors!
                    res.send(404);
                });
            } else {
                res.send({
                    status: 'user not found'
                });
            }

        }, function(err) {
            // give away no info from errors!
            res.send(404);
        });
    } else {
        res.send(404);
    }
};


// Used by user profiles
// Saves a following relationship between current user and another member
exports.unFollowUser = function(req, res, next) {
    var userId = utils.cleanNum(req.params.userId);
    if (userId) {
        new data.follower({
            user_id: req.user.id,
            follows_id: userId
        }).fetch().then(function(record) {
            if (record) {
                var recordid = record.attributes.id;

                new data.follower({
                    id: recordid
                }).destroy().then(function() {
                    res.send({
                        status: 'successful'
                    });
                }, function(err) {
                    // give away no info from errors!
                    res.send(404);
                });
            } else {
                res.send({
                    status: 'record not found'
                });
            }
        }, function(err) {
            // give away no info from errors!
            res.send(404);
        });
    } else {
        res.send(404);
    }
};

// Used by user profiles
// Gets activity for a given user
exports.getUserActivity = function(req, res, next) {
    var userId = utils.cleanNum(req.params.userId),
        activities = [],
        i;

    if (userId) {
        new data.user({
            id: userId
        }).fetch({
            withRelated: ['activity']
        }).then(function(user) {
            var results = [],
                item, message;
            if (user.relations.activity.length > 0) {
                // if message_id 10 (user comment) put directly, else create message from util. For translations!
                for (i = 0; i < user.relations.activity.length; i++) {
                    if (user.relations.activity.models[i].attributes.message_id === 10) {
                        message = user.relations.activity.models[i].attributes.message;
                    } else {
                        message = utils.activityMessage(user.relations.activity.models[i].attributes.message_id, user.attributes.username, user.relations.activity.models[i].attributes.references);
                    }
                    results.push({
                        message_id: user.relations.activity.models[i].attributes.message_id,
                        completedAt: user.relations.activity.models[i].attributes.completedAt,
                        message: message
                    })
                }
                res.send(results);
            } else {
                // give away no info from errors!
                res.send(404);
            }
        }, function() {
            // give away no info from errors!
            res.send(404);
        });
    } else {
        res.send(404);
    }
};

// Used by user profiles
// Gets activity  paged for a given user. used by infiniate scroll
exports.getUserActivityPage = function(req, res, next) {
    var userId = utils.cleanNum(req.params.userId),
        page = utils.cleanNum(req.params.page),
        activities = [],
        itemsPerPage = 20,
        i, offset = ((page - 1) * itemsPerPage);

    if (userId && page) {
        new data.user({
            id: userId
        }).fetch().then(function(user) {
            if (user) {
                var username = user.attributes.username;
                new data.activities().query(function(qb) {
                    qb.where({
                        user_id: userId
                    }).limit(itemsPerPage).offset(offset).orderBy('completedAt', 'DESC');
                }).fetch().then(function(model) {
                    if (model) {
                        var results = [],
                            item, message;

                        for (i = 0; i < model.length; i++) {
                            if (model.models[i].attributes.message_id === 10) {
                                message = model.models[i].attributes.message;
                            } else {
                                message = utils.activityMessage(model.models[i].attributes.message_id, username, model.models[i].attributes.references);
                            }

                            results.push({
                                message_id: model.models[i].attributes.message_id,
                                completedAt: model.models[i].attributes.completedAt,
                                message: message
                            });
                        }
                        res.send(results);
                    }
                }, function(err) {
                    // give away no info from errors!
                    res.send(404);
                });
            }
        }, function(err) {
            // give away no info from errors!
            res.send(404);
        });
    } else {
        res.send(404);
    }
};

// Used by user profiles
// Post a comment to activity feed from current user only
exports.postUserActivity = function(req, res, next) {
    var created = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (req.body.message) {
        var message = sanitizer.sanitize(req.body.message);
        if (message.length) {
            new data.activity({
                user_id: req.user.id,
                message_id: 10,
                completedAt: created,
                message: message
            }).save().then(function(model) {
                res.send(model);
            }, function(err) {
                // give away no info from errors!
                res.send(404);
            });
        } else {
            res.send(404);
        }

    }
};

// Used by books
// Gets comments from chapter id
exports.getComments = function(req, res, next) {
    var chapterId = utils.cleanNum(req.params.chapter);
    if (chapterId) {
        new data.comments().query(function(qb) {
            qb.where('chapter_id', '=', chapterId).andWhere('is_banned', '=', 0);
        }).fetch({
            withRelated: ['user']
        }).then(function(model) {
            res.send(model);
        }, function(err) {
            res.send(404);
        });
    }
};

// Used by books
// Posts comments by chapter id
exports.postComment = function(req, res) {
    var chapterId = utils.cleanNum(req.params.chapter),
        comment = sanitizer.sanitize(req.body.comment),
        user = req.user.id;

    if (chapterId && comment.length > 1 && comment.length < 140) {
        new data.comment({
            user_id: user,
            comment: comment,
            chapter_id: chapterId
        }).save().then(function(model) {
            res.send(model);
        }, function(err) {
            res.send(404);
        });
    } else {
        res.send(404);
    }
};

// Used by books
// Gets author details by chapter id
exports.getAuthor = function(req, res) {
    var userId = utils.cleanNum(req.params.userId);
    if (userId) {
        new data.user().query(function(qb) {
            qb.where('id', userId).column('id', 'username', 'avatar', 'points');
        }).fetch().then(function(model) {
            res.send(model);
        }, function(err) {
            res.send(404);
        });
    }
};


// Used by books.
// Submites user vote against a chapter
exports.submitVote = function(req, res) {
    var userId = req.user.id,
        book = utils.cleanNum(req.params.book),
        chapter = utils.cleanNum(req.params.chapter);

    new data.vote({
        user_id: userId,
        book_id: book,
        chapter_id: chapter
    }).fetch().then(function(model) {
        if (model) {
            res.send({
                status: 'Already voted'
            });
        } else {
            new data.vote({
                user_id: userId,
                book_id: book,
                chapter_id: chapter
            }).save().then(function() {
                res.send({
                    status: 'Vote submitted'
                });
            }, function(err) {
                res.send(404);
            });
        }
    }, function(err) {
        res.send(404)
    });
};

// Used by books.
// checks user vote against a chapter
exports.checkVote = function(req, res) {
    var userId = req.user.id,
        book = utils.cleanNum(req.params.book);

    new data.vote({
        user_id: userId,
        book_id: book,
        is_deleted: 0
    }).fetch().then(function(model) {
        if (model) {
            res.send({
                chapter: model.attributes.chapter_id
            });
        } else {
            res.send({
                chapter: null
            });
        }
    }, function(err) {
        res.send(404)
    });
};

// Used by books.
// checks user vote against a chapter
exports.deleteVote = function(req, res) {
    var userId = req.user.id,
        chapter = utils.cleanNum(req.params.chapter);

    new data.vote({
        user_id: userId,
        chapter_id: chapter,
        is_deleted: 0
    }).fetch().then(function(model) {
        if (model) {
            new data.vote({
                id: model.id
            }).save({
                is_deleted: 1
            }).then(function(mod) {
                res.send({
                    status: 'successful'
                });
            }, function(err) {
                res.send(404);
            });
        } else {
            res.send({
                chapter: null
            });
        }
    }, function(err) {
        res.send(404);
    });
};

// Used by user profiles
// Upload new profile image to cloudinary
// Does not work from local host!
exports.uploadProfileImage = function(req, res) {
    // req.files.path
    //http://www4.images.coolspotters.com/photos/1151265/emma-watson-profile.png
    cloudinary.uploader.upload("http://www4.images.coolspotters.com/photos/1151265/emma-watson-profile.png", function(result) {
        new data.user({
            id: req.user.id
        }).save({
            'avatar': result.url
        }).then(function(data) {
            res.send(result.url);
        }, function(err) {
            // give away no info from errors!
            res.send(404);
        });
    }, {
        crop: 'fill',
        width: 200,
        height: 210,
        tags: ['profile-image']
    });

};