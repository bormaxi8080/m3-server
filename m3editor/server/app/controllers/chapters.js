var _ = require('lodash');
var express = require('express');
var db = require('../../app').get('db');
var Authorize = require('./authorize');

var jsonsem = require('jsonsem');
var chapterValidator = new jsonsem(require('../../schema/chapter'));

var Chapters = {
    router: express.Router({strict: false})
};

Chapters.list = function(req, res, next) {
    db('chapters')
    .select()
    .exec(function(err, results) {
        if (err) {
            return res.json({error: "db_error", details: err.toString()});
        }

        res.json({
            chapters: results
        });
    });
};

Chapters.insert = function(req, res, next) {
    if (!chapterValidator.validate(req.body.data)) {
        return res.json({
            error: "validation_error",
            details: chapterValidator.errors
        });
    }
    var time = new Date();
    db('chapters')
    .returning('id')
    .insert({
        order: req.body.order,
        data: req.body.data,
        created_at: time,
        updated_at: time
    })
    .exec(function(err, results) {
        if (err || !results) {
            return res.json({error: "db_error", "details": err.toString()});
        }

        res.json({
            chapter_id: results[0]
        });
    });
};

Chapters.get = function(req, res, next) {
    db('chapters')
    .select()
    .where({id: req.params.id})
    .limit(1)
    .exec(function(err, results) {
        if (err) {
            return res.json({error: "db_error", "details": err.toString()});
        }

        if (!results.length) {
            return res.json({error: "chapter_not_found"});
        }

        res.json(results[0]);
    });
};

Chapters.update = function(req, res, next) {
    db.transaction(function(trx) {
        trx('chapters')
        .select('id')
        .forUpdate()
        .where({id: req.params.id})
        .limit(1)
        .exec(function(err, results) {
            if (err) {
                return trx.rollback({error: "db_error", "details": err.toString()});
            }

            if (!results.length) {
                return trx.rollback({error: "chapter_not_found"});
            }

            if (!chapterValidator.validate(req.body.data)) {
                return trx.rollback({
                    error: "validation_error",
                    details: chapterValidator.errors
                });
            }

            var columns = ['order', 'data'].reduce(function(res, prop) {
                if (_.has(req.body, prop)) {
                    res[prop] = req.body[prop];
                }
                return res;
            }, {updated_at: new Date()});

            trx('chapters')
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

Chapters.delete = function(req, res, next) {
    db.transaction(function(trx) {
        trx('chapters')
        .select('id')
        .forUpdate()
        .where({id: req.params.id})
        .limit(1)
        .exec(function(err, results) {
            if (err) {
                return trx.rollback({error: "db_error", "details": err.toString()});
            }

            if (!results.length) {
                return trx.rollback({error: "chapter_not_found"});
            }

            trx('chapters')
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

Chapters.rewriteAll = function(req, res, next) {
    db.transaction(function(trx) {
        trx('chapters')
        .del()
        .exec(function(err, results) {
            if (err) {
                return trx.rollback({error: "db_error", "details": err.toString()});
            }

            var validation_errors = req.body.chapters.reduce(function(memo, chapter) {
                if (!chapter.data) {
                    chapter.data = {
                        levels: chapter.levels,
                        bonus_level: chapter.bonus_level
                    };
                }
                if (!chapter.order) {
                    chapter.order = chapter.chapter_order;
                }

                if (!chapterValidator.validate(chapter.data)) {
                    memo[chapter.order] = chapterValidator.errors;
                }
                return memo;
            }, {});

            if (!_.isEmpty(validation_errors)) {
                return trx.rollback({
                    error: "validation_error",
                    details: validation_errors
                });
            }

            var now = new Date();
            trx('chapters')
            .insert(req.body.chapters.map(function(chapter) {
                return {
                    order: chapter.order,
                    data: chapter.data,
                    created_at: now,
                    updated_at: now
                };
            }))
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

Chapters.router.use(Authorize.authorizeUser);
Chapters.router.get("/", Chapters.list);
Chapters.router.post("/", Chapters.insert);
Chapters.router.put("/", Chapters.rewriteAll);

Chapters.router.get("/:id", Chapters.get);
Chapters.router.put("/:id", Chapters.update);
Chapters.router.delete("/:id", Chapters.delete);

module.exports = Chapters;
