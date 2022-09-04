var _ = require('lodash');
var async = require('async');
var express = require('express');

var db = require('../../app').get('db');
var Authorize = require('./authorize');

var Export = {
    router: express.Router({strict: false})
};

Export.all = function(req, res, next) {
    db('levels')
    .select()
    .exec(function(err, results) {
        if (err) {
            return res.json({error: "db_error", "details": err.toString()});
        }

        res.json({
            type: "all",
            levels: results
        });
    });
};

Export.chapters = function(req, res, next) {
    var extractLevelIds = function(chapters) {
        return chapters.reduce(function(memo, chapter) {
            var bonusLevel = chapter.data.bonus_level && chapter.data.bonus_level.default;
            return memo.concat([bonusLevel], chapter.data.levels.map(function(level) {
                return level.default;
            }));
        }, []).filter(function(levelId) {
            return levelId !== undefined
        });
    }
    var chapters = null;
    async.waterfall([
        function(cb) {
            db('chapters')
            .orderBy('order', 'asc')
            .select()
            .exec(cb)
        },
        function(results, cb) {
            chapters = results;
            db('levels')
            .select('id', 'data')
            .whereIn('id', _.unique(extractLevelIds(chapters)))
            .exec(cb)
        },
        function(levels, cb) {
            var levelMap = levels.reduce(function(memo, level) {
                memo[level.id] = level.data;
                return memo;
            }, {});
            var richChapters = chapters.reduce(function(memo, chapter) {
                var levels = chapter.data.levels.map(function(level) {
                    return levelMap[level.default];
                });

                var richChapter = {
                    levels: levels
                };

                var bonusLevelId = chapter.data.bonus_level && chapter.data.bonus_level.default;
                if (bonusLevelId !== undefined) {
                    richChapter.bonus_level = levelMap[bonusLevelId];
                };

                memo.push(richChapter);
                return memo;
            }, []);

            cb(null, richChapters)
        }
    ], function(err, result) {
        if (err) {
            res.json({error: "db_error", "details": err.toString()});
        } else {
            res.json({
                type: "chapters",
                chapters: result
            });
        }
        next();
    });
};

Export.router.use(Authorize.authorizeUser);
Export.router.get("/json/all", Export.all);
Export.router.get("/json/chapters", Export.chapters);

module.exports = Export;
