var _ = require('lodash');
var async = require('async');

var AccessProtocolError = require('./accessProtocolError');
var Journal = require('./journal');

var InviteManager = module.exports = function(core) {
    this.core = core;
    this.networkCodes = ['FB'];
};

InviteManager.prototype.shardKey = function(networkCode, networkId) {
    return networkCode + ':' + networkId;
};

InviteManager.prototype.transferInvites = function(fromUserId, toUserId, trx, callback) {
    trx.exec(function(knex, cb) {
        async.waterfall([
            function(cb) {
                knex('invites')
                .select()
                .whereIn('user_id', [fromUserId, toUserId])
                .forUpdate()
                .exec(cb);
            },
            function(invites, cb) {
                var invitesFrom = _.filter(invites, {user_id: parseInt(fromUserId)});
                var invitesTo = _.filter(invites, {user_id: parseInt(toUserId)});
                var invitesForUpdate = [];
                var invitesForAdd = invitesFrom.filter(function(invFrom) {
                    var invTo = _.find(invitesTo, {network_code: invFrom.network_code, network_id: invFrom.network_id});
                    if (!invTo) {
                        return true;
                    }
                    if (invFrom.is_invited && !invTo.is_invited) {
                        invitesForUpdate.push({
                            network_code: invFrom.network_code,
                            network_id: invFrom.network_id,
                            user_id: invTo.user_id
                        });
                    }
                    return false;
                }).map(function(inv) {
                    inv.user_id = toUserId;
                    return inv;
                });
                async.parallel([
                    function(cb) {
                        if (!invitesForAdd.length) {
                            return cb();
                        }
                        knex('invites')
                        .insert(invitesForAdd)
                        .exec(cb);
                    },
                    function(cb) {
                        knex('invites')
                        .del()
                        .where({user_id: fromUserId})
                        .exec(cb);
                    },
                    function(cb) {
                        async.eachLimit(invitesForUpdate, 5, function(where, cb) {
                            knex('invites')
                            .update({is_invited: true})
                            .where(where)
                            .exec(cb);
                        }, cb);
                    }
                ], cb);
            }
        ], cb);
    }, callback);
};

InviteManager.prototype.checkInvitesAndSendRewards = function(newUserId, networkCode, networkId, trx, callback) {
    var self = this;
    trx.execForKey(this.shardKey(networkCode, networkId), function(knex, cb) {
        async.waterfall([
            function(cb) {
                knex('invites')
                .select('user_id', 'data')
                .where({network_code: networkCode, network_id: networkId, is_invited: false})
                .forUpdate()
                .exec(cb);
            },
            function(result, cb) {
                if (!result.length) {
                    return cb();
                }
                var rewardUids = _.pluck(result, 'user_id');
                async.parallel([
                    function(cb) {
                        knex('invites')
                        .update({is_invited: true})
                        .whereIn('user_id', rewardUids)
                        .andWhere({network_code: networkCode, network_id: networkId})
                        .exec(cb);
                    },
                    function(cb) {
                        var messages = result.map(function(r) {
                            var reward;
                            if (r.data) {
                                reward = r.data.reward;
                            }
                            return self.core.messageManager.makeMessage(
                                r.user_id,
                                newUserId,
                                'invite_reward',
                                {
                                    network_code: networkCode,
                                    network_id: networkId,
                                    reward: reward
                                }
                            );
                        });
                        Journal.event('send_invite_reward', {from: newUserId, network_code: networkCode, network_id: networkId, uids: rewardUids});
                        self.core.messageManager.sendMessages(messages, trx, cb);
                    }
                ], cb);
            }
        ], cb);
    }, callback);
};

InviteManager.prototype.storeInvites = function(userId, networkCode, networkIds, data, callback) {
    var self = this;
    if (this.networkCodes.indexOf(networkCode) < 0) {
        return callback(new AccessProtocolError('unknown network code'));
    }
    if (!(Array.isArray(networkIds) && networkIds.length)) {
        return callback(new AccessProtocolError('networkIds is not array'));
    }

    networkIds = networkIds.map(String);
    var networkIdsByShards = _.groupBy(networkIds, function(nid) {
        var key = self.shardKey(networkCode, nid);
        return self.core.multiKnex.shardFor(key);
    });

    var queriesByShards = _.reduce(networkIdsByShards, function(memo, checkNetworkIds, shardId) {
        memo[shardId] = function(knex, cb) {
            async.waterfall([
                function(cb) {
                    knex('invites')
                    .select('network_id')
                    .whereIn('network_id', checkNetworkIds)
                    .andWhere({user_id: userId, network_code: networkCode})
                    .exec(cb);
                },
                function(storedNetworkIds, cb) {
                    storedNetworkIds = _.pluck(storedNetworkIds, 'network_id');
                    var forInsert = _.without.apply(_, [checkNetworkIds].concat(storedNetworkIds));
                    var forUpdate = _.without.apply(_, [checkNetworkIds].concat(forInsert));
                    var tasks = [];
                    if (forInsert.length) {
                        tasks.push(function(cb) {
                            var rows = _.map(forInsert, function(nid) {
                                return {
                                    user_id: userId,
                                    network_code: networkCode,
                                    network_id: nid,
                                    is_invited: false,
                                    data: data,
                                    created_at: new Date()
                                };
                            });
                            knex('invites')
                            .insert(rows)
                            .exec(cb);
                        });
                    }
                    if (forUpdate.length) {
                        tasks.push(function(cb) {
                            async.eachLimit(forUpdate, 5, function(nid, cb) {
                                knex('invites')
                                .update({data: data})
                                .where({
                                    network_code: networkCode,
                                    network_id: nid,
                                    user_id: userId,
                                    is_invited: false
                                })
                                .exec(cb);
                            }, cb);
                        });
                    }
                    async.parallel(tasks, function(err) {
                        cb(err, forInsert);
                    });
                }
            ], cb);
        };
        return memo;
    }, {});

    self.core.multiKnex.transactionally(function(trx, cb) {
        trx.execByShards(queriesByShards, cb);
    }, callback);
};

InviteManager.prototype.fetchInvites = function(networkCode, userId, trx, callback) {
    if (this.networkCodes.indexOf(networkCode) < 0) {
        return callback(new AccessProtocolError('unknown network code'));
    }
    trx.exec(function(knex, cb) {
        knex('invites')
        .select('network_id', 'is_invited', 'data')
        .where({user_id: userId, network_code: networkCode})
        .exec(cb);
    }, callback);
};
