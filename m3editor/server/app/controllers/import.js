var _ = require('lodash');
var async = require('async');
var express = require('express');

var db = require('../../app').get('db');
var Authorize = require('./authorize');

var Import = {
    router: express.Router({strict: false})
};

Import.levels = function(trx, levels, callback) {
    trx('levels')
    .insert(levels.map(function(level) {
        delete level.id;
        return level;
    }))
    .exec(callback);
};

Import.entryPoint = function(req, res, next) {
    var importType = req.body.type;
    if (importType === "all") {
        db.transaction(function(trx) {
            async.parallel([
                function(cb) { Import.levels(trx, req.body.levels, cb); }
            ], function(err) {
                if (err) {
                    trx.rollback(err);
                } else {
                    trx.commit();
                }
            });
        }).exec(function(err) {
            if (err) {
                return res.json({error: "db_error", details: err.toString()});
            }
            res.json({result: "OK"});
        });
    } else {
        return res.json({error: "unknown_import_type", details: importType});
    }
};

Import.router.use(Authorize.authorizeUser);
Import.router.post("/json", Import.entryPoint);
module.exports = Import;
