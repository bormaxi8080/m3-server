var Session = require('../models/session');
var User = require('../models/user');
var basicAuth = require('basic-auth-connect');
var express = require('express');

var db = require('../../app').get('db');

var Authorize = {};

Authorize.login = function(req, res) {
    var user_name = req.body.user;
    var user_password = req.body.password;
    if (!user_name || !user_password) {
        return res.json({'error': 'login_failed'});
    }

    var new_token;
    db.transaction(function(trx) {
        trx('users')
        .select('id', 'name', 'hash', 'created_at')
        .where({name: user_name})
        .limit(1)
        .exec(function(err, users) {
            if (err || !users.length) {
                return trx.rollback();
            }
            var user = users[0];
            if (user.hash != User.hashPassword(user.created_at.toString(), user_password)) {
                return trx.rollback();
            }
            new_token = Session.generateId(user.name, user.hash);

            trx('sessions')
            .select('token')
            .where({user_id: user.id})
            .forUpdate()
            .exec(function(err, result) {
                if (err) { return trx.rollback(); }

                var time = new Date();
                if (result.length) {
                    var old_token = result[0].token;
                    trx('sessions')
                    .update({token: new_token, updated_at: time})
                    .where({token: old_token})
                    .exec(function(err, result) {
                        if (err) { return trx.rollback(); }
                        trx.commit();
                    });
                } else {
                    trx('sessions')
                    .insert({token: new_token, user_id: user.id, updated_at: time, created_at: time })
                    .exec(function(err, result) {
                        if (err) { return trx.rollback(); }
                        trx.commit();
                    });
                }
            });
        });
    }).exec(function(err) {
        res.json(err ? {error: 'login_failed'} : {token: new_token});
    });
};

Authorize.logout = function(req, res) {
    var token = req.body.token;
    db('sessions')
    .where({token: token})
    .delete()
    .exec(function(err, result) {
        if (err) {
            return res.json({'error': 'logout_failed'});
        }
        res.json({'result': 'ok'});
    });
};

Authorize.authorizeUser = function(req, res, next) {
    var token = req.query.token;
    db('sessions')
    .select('user_id')
    .where({token: token})
    .exec(function(err, result) {
        if (err) {
            return res.json({'error': 'auth_failed'});
        }

        if (result.length) {
            db('users')
            .select('id')
            .where({id: result[0].user_id})
            .exec(function(err, results) {
                if (err || !results) {
                    return res.json({'error': 'auth_failed'});
                }
                req.user_id = result[0].user_id;
                next();
            });
        } else {
            return res.json({'error': 'auth_failed'});
        }
    });
};

Authorize.basicHttpAuthorizer = basicAuth(function(username, password, next) {
    db('users')
    .select('id', 'name', 'hash', 'created_at')
    .where({name: username})
    .limit(1)
    .exec(function(err, users) {
        if (err || !users.length) {
            return next("AUTH_FAILED", false);
        }
        var user = users[0];
        if (user.hash == User.hashPassword(user.created_at.toString(), password)) {
            return next(null, true);
        } else {
            return next("AUTH_FAILED", false);
        }
    });
});

module.exports = Authorize;
