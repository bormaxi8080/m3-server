var _ = require('lodash');
var express = require('express');
var db = require('../../app').get('db');
var Authorize = require('./authorize');

var Users = {
    router: express.Router({strict: false})
};

Users.list = function(req, res, next) {
    db('users')
    .select('id', 'name')
    .exec(function(err, results) {
        if (err) {
            return res.json({error: "db_error", "details": err.toString()});
        }

        res.json({
            users: results
        });
    });
};


Users.router.use(Authorize.authorizeUser);
Users.router.get("/", Users.list);

module.exports = Users;
