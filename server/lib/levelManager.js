var _ = require('lodash');
var async = require('async');

LevelManager = module.exports = function(core) {
    this.core = core;
};

LevelManager.prototype.formatLevels = function(levels) {
    return levels.reduce(function(memo, level) {
        memo[level.level] = level.score;
        return memo;
    }, {});
};

LevelManager.prototype.formatLevelsByUserIds = function(levels) {
    return levels.reduce(function(memo, level) {
        memo[level.user_id] = level.score;
        return memo;
    }, {});
};

LevelManager.prototype.mergeLevelsData = function(fromUserId, toUserId, trx, callback) {
    var self = this;
    async.waterfall([
        function(cb) {
            async.parallel([
                function(cb) { self.fetchLevels(fromUserId, null, trx, cb); },
                function(cb) { self.fetchLevels(toUserId, null, trx, cb); }
            ], cb);
        },
        function(results, cb) {
            var fromLevels = results[0];
            var toLevels = results[1];
            var affectedLevels = _.union(Object.keys(fromLevels), Object.keys(toLevels));
            var levelsByAction = affectedLevels.reduce(function(memo, id) {
                if (!toLevels[id]) {
                    memo.create[id] = fromLevels[id];
                } else if (toLevels[id] < fromLevels[id]) {
                    memo.update[id] = fromLevels[id];
                }
                return memo;
            }, {update: {}, create: {}});

            async.parallel([
                function(cb) { self.updateLevels(toUserId, levelsByAction.update, trx, cb); },
                function(cb) { self.createLevels(toUserId, levelsByAction.create, trx, cb); }
            ], cb);
        }
    ], function(err) {
        callback(err);
    });
};

LevelManager.prototype.fetchLevels = function(userId, levels, trx, callback) {
    var self = this;
    this.fetchLevelsData(userId, levels, trx, function(err, levels) {
        callback(err, err ? null : self.formatLevels(levels));
    });
};

LevelManager.prototype.fetchUsersByLevel = function(userIds, level, trx, callback) {
    var self = this;
    self.fetchLevelDataByUsers(userIds, level, trx, function(err, levels) {
        callback(err, err ? null : self.formatLevelsByUserIds(levels));
    });
};

LevelManager.prototype.filterLevels = function(levels, filter) {
    return _.filter(levels, function(level) {
        return _.contains(filter, level.level);
    });
};

LevelManager.prototype.groupLevelsDataByLevels = function(levels) {
    return _.groupBy(levels, function(level) {
        return level.level;
    });
};

LevelManager.prototype.fetchUsersByLevels = function(userIds, levels, trx, callback) {
    var self = this;
    self.fetchLevelsDataByUsers(userIds, levels, trx, function(err, results) {
        var result = _.reduce(self.groupLevelsDataByLevels(results), function(memo, value, key) {
            memo[key] = self.formatLevelsByUserIds(value);
            return memo;
        }, {});
        callback(err, err ? null : result);
    });
};

LevelManager.prototype.fetchLevelDataByUsers = function(userIds, level, trx, callback) {
    var usersByShards = this.core.userManager.usersByShards(userIds, trx);
    var queriesByShards = _.reduce(usersByShards, function(memo, users, shardId) {
        memo[shardId] = function(knex, cb) {
            knex('levels')
            .select('user_id', 'score')
            .whereIn('user_id', users)
            .andWhere({level: level})
            .exec(cb);
        };
        return memo;
    }, {});
    trx.execByShards(queriesByShards, callback);
};

LevelManager.prototype.fetchLevelsDataByUsers = function(userIds, levels, trx, callback) {
    var usersByShards = this.core.userManager.usersByShards(userIds, trx);
    var queriesByShards = _.reduce(usersByShards, function(memo, users, shardId) {
        memo[shardId] = function(knex, cb) {
            knex('levels')
            .select('user_id', 'level', 'score')
            .where(function() {
                return this.whereIn('user_id', usersByShards[shardId]);
            })
            .andWhere(function() {
                return this.whereIn('level', levels);
            })
            .exec(cb);
        };
        return memo;
    }, {});
    trx.execByShards(queriesByShards, callback);
};

LevelManager.prototype.fetchLevelsData = function(userId, levels, trx, callback) {
    trx.execForKey(userId, function(knex, cb) {
        var query = knex('levels')
        .select('level', 'score');
        if (levels) {
            if (levels.length === 1) {
                query.where({
                    user_id: userId,
                    level: levels[0]
                }).limit(1);
            } else {
                query.whereIn('level', levels)
                .andWhere({user_id: userId});
            }
        } else {
            query.where({
                user_id: userId
            });
        }
        if (trx.isTransaction) {
            query.forUpdate();
        }
        query.exec(cb);
    }, function(err, result) {
        callback(err, err ? null : result);
    });
};

LevelManager.prototype.deleteAllLevelsData = function(userId, trx, callback) {
    trx.execForKey(userId, function(knex, cb) {
        knex('levels')
        .where({user_id: userId})
        .del()
        .exec(cb);
    }, callback);
};

LevelManager.prototype.updateLevels = function(userId, levels, trx, callback) {
    if (_.isEmpty(levels)) {
        return callback();
    }

    var self = this;
    var bindings = [].concat.apply([new Date()], _.map(levels, function(score, id) {
        return [userId, id, score];
    }));
    var query = "update levels as l set score = c.score, updated_at = ? from (values " +
         _.map(levels, function() { return "(?::int, ?, ?::int)"; }).join(", ") +
    ") as c(user_id, level, score) where c.user_id = l.user_id and c.level = l.level";
    trx.execForKey(userId, function(knex, cb) {
        knex.raw(query, bindings).exec(cb);
    }, callback);
};

LevelManager.prototype.createLevels = function(userId, levels, trx, callback) {
    if (_.isEmpty(levels)) {
        return callback();
    }

    var self = this;
    var now = new Date();
    trx.execForKey(userId, function(knex, cb) {
        knex('levels')
        .insert(_.map(levels, function(score, id) {
            return {
                user_id: userId,
                level: id,
                score: score,
                updated_at: now
            };
        }))
        .exec(cb);
    }, callback);
};
