var _ = require('lodash');
var async = require('async');
var clone = require('node-v8-clone').clone;

var Journal = require('./journal');

var UserManager = module.exports = function(core) {
    this.core = core;
    this.mappedColumns = [
        'progress',
        'sharing_count',
        'real_balance',
        'game_balance',
        'group',
        'tester',
        'finish_level_time'
    ];
};

UserManager.prototype.create = function(network, callback) {
    var self = this;
    async.waterfall([
        function(cb) { self.fetchNextUserId(cb); },
        function(nextUserId, cb) {
            self.core.multiKnex.transactionally(function(trx, cb) {
                async.parallel([
                    function(cb) { self.core.networkManager.activateNewNetwork(network, nextUserId, trx, cb); },
                    function(cb) { self.createUserData(nextUserId, trx, cb); },
                ], function(err) { cb(err, nextUserId); });
            }, cb);
        }
    ], function(err, nextUserId) {
        if (!err) { Journal.event('user_create', {user: nextUserId}); }
        callback(err, nextUserId);
    });
};

UserManager.prototype.reset = function(userId, callback) {
    var self = this;

    self.core.multiKnex.transactionally(function(trx, cb) {
        var newUserData;

        async.waterfall([
            function(cb) { self.fetchUserData(userId, trx, cb); },
            function(userData, cb) {
                async.parallel([
                    function(cb) {
                        newUserData = self.resetUserData(userData);
                        self.updateUserData(userId, newUserData, trx, cb);
                    },
                    function(cb) { self.core.levelManager.deleteAllLevelsData(userId, trx, cb); }
                ], function(err) {
                    if (!err) { Journal.event('user_reset', {user: userId}); }
                    cb(err, newUserData);
                });
            }
        ], cb);
    }, callback);
};

UserManager.prototype.tryMerge = function(fromUserId, toUserId, callback) {
    var self = this;
    this.core.networkManager.compareNetworks(fromUserId, toUserId, function(err, hasConcurrent) {
        if (err) { return callback(err); }
        if (hasConcurrent) {
            callback({error: "network_merge_restricted"});
        } else {
            self.merge(fromUserId, toUserId, callback);
        }
    });
};

UserManager.prototype.tryMergeOrSelect = function(fromUserId, toUserId, callback) {
    var self = this;
    this.core.networkManager.compareNetworks(fromUserId, toUserId, function(err, hasConcurrent) {
        if (err) { return callback(err); }
        if (hasConcurrent) {
            callback(null, toUserId);
        } else {
            self.merge(fromUserId, toUserId, callback);
        }
    });
};

UserManager.prototype.merge = function(fromUserId, toUserId, callback) {
    var self = this;
    this.core.multiKnex.transactionally(function(trx, cb) {
        async.parallel([
            function(cb) { self.core.sessionManager.transferSessions(fromUserId, toUserId, trx, cb); },
            function(cb) { self.core.networkManager.transferNetworks(fromUserId, toUserId, trx, cb); },
            function(cb) { self.core.journalManager.transferJournal(fromUserId, toUserId, trx, cb); },
            function(cb) { self.core.levelManager.mergeLevelsData(fromUserId, toUserId, trx, cb); },
            function(cb) { self.core.inviteManager.transferInvites(fromUserId, toUserId, trx, cb); },
            function(cb) { self.mergeUserData(fromUserId, toUserId, trx, cb); }
        ], cb);
    }, function(err) {
        if (!err) { Journal.event('user_merge', {from: fromUserId, to: toUserId}); }
        callback(err, toUserId);
    });
};

UserManager.prototype.mergeUserData = function(fromUserId, toUserId, trx, callback) {
    var self = this;

    async.waterfall([
        function(cb) {
            async.parallel([
                function(cb) { self.fetchUserState(fromUserId, trx, cb); },
                function(cb) { self.fetchUserState(toUserId, trx, cb); }
            ], cb);
        },
        function(results, cb) {
            var newUserState = self.mergeUserState(results[0], results[1]);
            async.parallel([
                function(cb) { self.updateUserState(toUserId, newUserState, trx, cb); },
                function(cb) { self.deleteUserData(fromUserId, trx, cb); }
            ], cb);
        }
    ], callback);
};

UserManager.prototype.getUserInitData = function(userId) {
    return _.extend({user_id: userId}, this.core.config.init);
};

UserManager.prototype.resetUserData = function(userData) {
    var newUserData = clone(userData, true);
    newUserData.progress = 1;
    newUserData.sharing_count = 0;
    newUserData.game_balance = 0;
    newUserData.real_balance = 0;
    newUserData.data = this.getUserInitData(userData.id);
    return newUserData;
};

UserManager.prototype.createUserData = function(userId, trx, callback) {
    var self = this;
    trx.execForKey(userId, function(knex, cb) {
        var now = new Date();
        knex('users')
        .insert({
            id: userId,
            data: self.getUserInitData(userId),
            migration: self.core.migrationManager.latestMigration,
            created_at: now,
            updated_at: now
        })
        .exec(cb);
    }, callback);
};

UserManager.prototype.mapUserState = function(userDataRow) {
    return _.reduce(this.mappedColumns, function(memo, column) {
        memo[column] = userDataRow[column];
        return memo;
    }, userDataRow.data);
};

UserManager.prototype.unmapUserState = function(userState) {
    var cleanUserState = clone(userState, false);
    return _.reduce(this.mappedColumns, function(memo, column) {
        memo[column] = cleanUserState[column];
        delete cleanUserState[column];
        return memo;
    }, {data: cleanUserState});
};

UserManager.prototype.fetchUserState = function(userId, trx, callback) {
    var self = this;
    async.waterfall([
        function(cb) { self.fetchUserData(userId, trx, cb); },
        function(userDataRow, cb) { self.migrateUserState(userId, self.mapUserState(userDataRow), parseInt(userDataRow.migration), cb); }
    ], callback);
};

UserManager.prototype.migrateUserState = function(userId, state, migration, callback) {
    if (migration === this.core.migrationManager.latestMigration) {
        callback(null, state);
    } else {
        try {
            state = this.core.migrationManager.migrate(userId, state, migration, this.core.migrationManager.latestMigration);
        } catch (e) {
            callback(e);
        }
        callback(null, state);
    }
};

UserManager.prototype.updateUserState = function(userId, state, trx, callback) {
    this.updateUserData(userId, this.unmapUserState(state), trx, callback);
};

UserManager.prototype.fetchUserData = function(userId, trx, callback) {
    trx.execForKey(userId, function(knex, cb) {
        var query = knex('users')
        .select()
        .where({id: userId});
        if (trx.isTransaction) {
            query = query.forUpdate();
        }
        query.exec(cb);
    }, function(err, result) {
        callback(err, err ? null : result[0]);
    });
};

UserManager.prototype.usersByShards = function(userIds, trx) {
    return _.groupBy(userIds, function(userId) {
        return trx.shardFor(userId);
    });
};

UserManager.prototype.fetchUserColumnByIds = function(userIds, column, trx, callback) {
    var self = this;
    this.fetchUsersColumns(userIds, column, trx, function(err, result) {
        callback(err, err ? null : self.mapUserColumnByIds(result, column), callback);
    });
};

UserManager.prototype.fetchUsersColumns = function(userIds, columns, trx, callback) {
    if (Array.isArray(columns)) {
        columns.push('id');
    } else {
        columns = ['id', columns];
    }
    var usersByShards = this.usersByShards(userIds, trx);
    var queriesByShards = _.reduce(usersByShards, function(memo, users, shardId) {
        memo[shardId] = function(knex, cb) {
            knex('users')
            .select(columns)
            .whereIn('id', users)
            .exec(cb);
        };
        return memo;
    }, {});

    trx.execByShards(queriesByShards, callback);
};

UserManager.prototype.mapUserColumnByIds = function(userRows, column) {
    return userRows.reduce(function(memo, row) {
        memo[row.id] = row[column];
        return memo;
    }, {});
};

UserManager.prototype.deleteUserData = function(userId, trx, callback) {
    trx.execForKey(userId, function(knex, cb) {
        knex('users')
        .where({id: userId})
        .del()
        .exec(cb);
    }, callback);
};

UserManager.prototype.updateUserData = function(userId, data, trx, callback) {
    var self = this;
    trx.execForKey(userId, function(knex, cb) {
        knex('users')
        .where({id: userId})
        .update(_.extend(data, {
            migration: self.core.migrationManager.latestMigration,
            updated_at: new Date()
        }))
        .exec(cb);
    }, callback);
};

UserManager.prototype.fetchNextUserId = function(callback) {
    this.core.standaloneKnex.raw("SELECT nextval('user_id_sequence')").exec(function(err, result) {
        callback(err, err ? null : parseInt(result.rows[0].nextval, 10));
    });
};

UserManager.prototype.mergeGroup = function(groupFrom, groupTo) {
    return (groupTo !== 'default') ? groupTo : groupFrom;
};

UserManager.prototype.mergeUserState = function(userStateFrom, userStateTo) {
    return {
        user_id: userStateTo.user_id,
        progress: Math.max(userStateFrom.progress, userStateTo.progress),
        sharing_count: userStateFrom.sharing_count + userStateTo.sharing_count,
        data: {
            user_id: userStateTo.user_id,
            cafe: {
                items: _.extend(userStateFrom.cafe.items, userStateTo.cafe.items),
                slots: _.extend(userStateFrom.cafe.slots, userStateTo.cafe.slots)
            },
            bonus_levels: _.reduce(_.union(Object.keys(userStateFrom.bonus_levels), Object.keys(userStateTo.bonus_levels)), function(memo, state) {
                memo[state] = _.union(userStateFrom.bonus_levels[state] || [], userStateTo.bonus_levels[state] || []);
                return memo;
            }, {})
        },
        real_balance: userStateFrom.real_balance + userStateTo.real_balance,
        game_balance: userStateFrom.game_balance + userStateTo.game_balance,
        group: this.mergeGroup(userStateFrom.group, userStateTo.group),
        tester: userStateFrom.tester || userStateTo.tester
    };
};
