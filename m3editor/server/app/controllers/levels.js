var _ = require('lodash');
var express = require('express');
var db = require('../../app').get('db');
var Authorize = require('./authorize');

var jsonsem = require('jsonsem');
var levelValidator = new jsonsem(require('../../schema/level.js'));

var Levels = {
    router: express.Router({strict: false})
};

Levels.list = function(req, res, next) {
    db('levels')
    .select()
    .exec(function(err, results) {
        if (err) {
            return res.json({error: "db_error", "details": err.toString()});
        }

        res.json({
            levels: results
        });
    });
};

Levels.insert = function(req, res, next) {
    if (!levelValidator.validate(req.body.data)) {
        return res.json({
            error: "validation_error",
            details: levelValidator.errors
        });
    }
    var time = new Date();
    db('levels')
    .returning('id')
    .insert({
        name: req.body.name,
        data: req.body.data,
        created_at: time,
        updated_at: time
    })
    .exec(function(err, results) {
        if (err || !results) {
            return res.json({error: "db_error", "details": err.toString()});
        }

        res.json({
            level_id: results[0]
        });
    });
};

Levels.get = function(req, res, next) {
    db('levels')
    .select()
    .where({id: req.params.id})
    .limit(1)
    .exec(function(err, results) {
        if (err) {
            return res.json({error: "db_error", "details": err.toString()});
        }

        if (!results.length) {
            return res.json({error: "level_not_found"});
        }

        res.json(results[0]);
    });
};

Levels.update = function(req, res, next) {
    var commited = false;
    db.transaction(function(trx) {
        trx('levels')
        .select()
        .forUpdate()
        .where({id: req.params.id})
        .limit(1)
        .exec(function(err, results) {
            if (err) {
                return trx.rollback({error: "db_error", "details": err.toString()});
            }

            if (!results.length) {
                return trx.rollback({error: "level_not_found"});
            }

            if (!levelValidator.validate(req.body.data)) {
                return trx.rollback({
                    error: "validation_error",
                    details: levelValidator.errors
                });
            }

            var columns = ['name', 'data'].reduce(function(res, prop) {
                if (_.has(req.body, prop)) {
                    res[prop] = req.body[prop];
                }
                return res;
            }, {updated_at: new Date()});

            trx('levels')
            .update(columns)
            .where({id: req.params.id})
            .limit(1)
            .exec(function(err, results) {
                if (err) {
                    return trx.rollback({error: "db_error", "details": err.toString()});
                }

                trx.commit();
            });
        });

    }).exec(function(err, results) {
        res.json(err ? err : {result: "ok"});
    });
};

Levels.delete = function(req, res, next) {
    db.transaction(function(trx) {
        trx('levels')
        .select()
        .forUpdate()
        .where({id: req.params.id})
        .limit(1)
        .exec(function(err, results) {
            if (err) {
                return trx.rollback({error: "db_error", "details": err.toString()});
            }

            if (!results.length) {
                return trx.rollback({error: "level_not_found"});
            }

            var level = results[0];

            trx('levels')
            .delete()
            .where({id: req.params.id})
            .limit(1)
            .exec(function() {
                if (err) {
                    return trx.rollback({error: "db_error", "details": err.toString()});
                }

                trx.commit();
            });
        });
    }).exec(function(err, results) {
        res.json(err ? err : {result: "ok"});
    });
};

Levels.router.use(Authorize.authorizeUser);
Levels.router.get("/", Levels.list);
Levels.router.post("/", Levels.insert);

Levels.router.get("/:id", Levels.get);
Levels.router.put("/:id", Levels.update);
Levels.router.delete("/:id", Levels.delete);

module.exports = Levels;
