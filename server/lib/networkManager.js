var _ = require('lodash');
var async = require('async');

NetworkManager = module.exports = function(core) {
    this.core = core;
    this.standaloneNetworkCodes = ['FB', 'MM', 'OK'];
    this.authNetworkCodes = ['FB', 'GC', 'MM', 'OK'];
    this.clientNetworkCodes = ['device'];
};

NetworkManager.prototype.generateNetwork = function(networkCode, networkId) {
    return {
        network_code: networkCode,
        network_id: networkId
    };
};

NetworkManager.prototype.whereNetworkClause = function(network) {
    return function() {
        this.where(network);
    };
};

NetworkManager.prototype.networksByShards = function(networks, trx) {
    var self = this;
    return _.groupBy(networks, function(network) {
        return trx.shardFor(self.reverseNetworkKey(network));
    });
};

NetworkManager.prototype.redisNetworkKey = function(network) {
    return 'n:' + network.network_code + "_" + network.network_id;
};

NetworkManager.prototype.formatNetworksByNetworkCode = function(networks) {
    var result = {};
    var len = networks.length;
    for (var i = 0; i < len; i++) {
        if (!result[networks[i].network_code]) {
            result[networks[i].network_code] = {};
        }
        result[networks[i].network_code][networks[i].network_id] = networks[i].user_id;
    }
    return result;
};

NetworkManager.prototype.buildNetworksFromCredentials = function(credentials) {
    var self = this;
    var results = _.map(Object.keys(credentials), function(networkCode) {
        return _.map(credentials[networkCode], function(networkId) {
            return self.generateNetwork(networkCode, networkId);
        });
    });
    return [].concat.apply([], results);
};

NetworkManager.prototype.fetchUserIdByNetwork = function(network, callback) {
    var self = this;
    self.fetchRedisNetwork(network, function(err, result) {
        if (err) { return callback(err); }
        if (result) {
            return callback(null, result);
        }
        self.fetchDatabaseReverseNetwork(network, self.core.multiKnex, callback);
    });
};

NetworkManager.prototype.fetchNetworksByCredentials = function(credentials, trx, callback) {
    var self = this;
    var networks = self.buildNetworksFromCredentials(credentials);
    self.fetchDatabaseReverseNetworks(networks, trx, function(err, networks) {
        callback(err, err ? null : self.formatNetworksByNetworkCode(networks));
    });
};

NetworkManager.prototype.fetchRedisNetwork = function(network, callback) {
    this.core.redis.get(this.redisNetworkKey(network), function(err, result) {
        callback(err, result);
    });
};

NetworkManager.prototype.reverseNetworkKey = function(network) {
    return network.network_code + '_' + network.network_id;
};

NetworkManager.prototype.fetchDatabaseReverseNetwork = function(network, trx, callback) {
    trx.execForKey(this.reverseNetworkKey(network), function(knex, cb) {
        knex('reverse_networks')
        .select('user_id')
        .where(network)
        .limit(1)
        .exec(cb);
    }, function(err, result) {
        callback(err, (result && result.length) ? result[0].user_id : null);
    });
};

NetworkManager.prototype.fetchDatabaseReverseNetworks = function(networks, trx, callback) {
    var self = this;

    var networksByShards = self.networksByShards(networks, trx);
    var queriesByShards = _.reduce(networksByShards, function(memo, networks, shardId) {
        memo[shardId] = function(knex, cb) {
            var query = knex('reverse_networks')
            .select('network_code', 'network_id', 'user_id')
            .where(self.whereNetworkClause(networks[0]));
            var len = networks.length;
            if (len > 1) {
                for (var i = 1; i < len; ++i) {
                    query = query.orWhere(self.whereNetworkClause(networks[i]));
                }
            }
            query.exec(cb);
        };
        return memo;
    }, {});

    trx.execByShards(queriesByShards, callback);
};

NetworkManager.prototype.fetchDatabaseNetworks = function(userId, trx, callback) {
    var self = this;
    trx.execForKey(userId, function(knex, cb) {
        var query = knex('networks')
        .select('network_code', 'network_id')
        .where({user_id: userId});
        if (query.isTransaction) {
            query = query.forUpdate();
        }
        query.exec(cb);
    }, callback);
};

NetworkManager.prototype.activateNewNetwork = function(network, userId, trx, callback) {
    var self = this;
    async.parallel([
        function(cb) { self.writeNetwork(network, userId, trx, cb); },
        function(cb) { self.core.inviteManager.checkInvitesAndSendRewards(userId, network.network_code, network.network_id, trx, cb); }
    ], callback);
};

NetworkManager.prototype.writeNetwork = function(network, userId, trx, callback) {
    var self = this;
    async.parallel([
        function(cb) { self.writeDatabaseNetwork(network, userId, trx, cb); },
        function(cb) { self.writeDatabaseReverseNetwork(network, userId, trx, cb); },
        function(cb) { self.writeRedisNetwork(network, userId, cb); }
    ], callback);
};

NetworkManager.prototype.writeDatabaseNetwork = function(network, userId, trx, callback) {
    trx.execForKey(userId, function(knex, cb) {
        knex
        .insert(_.extend(network, {user_id: userId}))
        .into('networks')
        .exec(cb);
    }, callback);
};

NetworkManager.prototype.writeDatabaseReverseNetwork = function(network, userId, trx, callback) {
    var self = this;
    trx.execForKey(self.reverseNetworkKey(network), function(knex, cb) {
        knex
        .insert(_.extend(network, {user_id: userId}))
        .into('reverse_networks')
        .exec(cb);
    }, callback);
};

NetworkManager.prototype.writeRedisNetwork = function(network, userId, callback) {
    this.core.redis.set(this.redisNetworkKey(network), userId, callback);
};

NetworkManager.prototype.transferNetworks = function(fromUser, toUser, trx, callback) {
    var self = this;
    async.waterfall([
        function(cb) { self.fetchDatabaseNetworks(fromUser, trx, cb); },
        function(networks, cb) {
            async.parallel([
                function(cb) { self.transferRedisNetworks(networks, toUser, cb); },
                function(cb) { self.transferDatabaseNetworks(networks, fromUser, toUser, trx, cb); },
                function(cb) { self.transferDatabaseReverseNetworks(networks, fromUser, toUser, trx, cb); }
            ], function(err) {
               cb(err);
            });
        }
    ], callback);
};

NetworkManager.prototype.transferRedisNetworks = function(networks, toUser, callback) {
    var self = this;
    async.each(networks, function(network, cb) {
        self.writeRedisNetwork(network, toUser, cb);
    }, callback);
};

NetworkManager.prototype.transferDatabaseNetworks = function(networks, fromUser, toUser, trx, callback) {
    var self = this;
    var fromShard = trx.shardFor(fromUser);
    var toShard = trx.shardFor(toUser);
    if (fromShard === toShard) {
        trx.execForShard(fromShard, function(knex, cb) {
            knex('networks')
            .where({user_id: fromUser})
            .update({user_id: toUser})
            .exec(cb);
        }, function(err) {
           callback(err);
        });
    } else {
        var queriesByShards = {};
        var networksWithUsers = _.map(networks, function(network) {
            return _.extend(network, {user_id: toUser});
        });
        queriesByShards[fromShard] = function(knex, cb) {
            knex('networks')
            .where({user_id: fromUser})
            .del()
            .exec(cb);
        };
        queriesByShards[toShard] = function(knex, cb) {
            knex('networks')
            .insert(networksWithUsers)
            .exec(cb);
        };
        trx.execByShards(queriesByShards, function(err) {
            callback(err);
        });
    }
};

NetworkManager.prototype.transferDatabaseReverseNetworks = function(networks, fromUser, toUser, trx, callback) {
    var self = this;

    var networksByShards = self.networksByShards(networks, trx);
    var queriesByShards = _.reduce(networksByShards, function(memo, networks, shardId) {
        memo[shardId] = function(knex, cb) {
            var query = knex('reverse_networks')
            .update({user_id: toUser})
            .where(self.whereNetworkClause(networks[0]));
            var len = networks.length;
            if (len > 1) {
                for (var i = 1; i < len; ++i) {
                    query = query.orWhere(self.whereNetworkClause(networks[i]));
                }
            }
            query.exec(cb);
        };
        return memo;
    }, {});

    trx.execByShards(queriesByShards, callback);
};

NetworkManager.prototype.compareNetworks = function(fromUser, toUser, callback) {
    var self = this;
    async.waterfall([
        function(cb) {
            async.parallel([
                function(cb) { self.fetchDatabaseNetworks(fromUser, self.core.multiKnex, cb); },
                function(cb) { self.fetchDatabaseNetworks(toUser, self.core.multiKnex, cb); }
            ], cb);
        },
        function(results, cb) {
            cb(null, self.hasConcurrentNetworks(results[0], results[1]));
        }
    ], callback);
};

NetworkManager.prototype.hasConcurrentNetworks = function(fromUserNetworks, toUserNetworks) {
    var collectNetworkTypes = function(networks) {
        return networks.reduce(function(memo, network) {
            memo[network.network_code] = true;
            return memo;
        }, {});
    };
    var fromNetworkCodes = collectNetworkTypes(fromUserNetworks);
    var toNetworkCodes = collectNetworkTypes(toUserNetworks);
    return this.standaloneNetworkCodes.some(function(code) {
        return fromNetworkCodes[code] && toNetworkCodes[code];
    });
};

NetworkManager.prototype.isValidClientPair = function(clientCode, authCode) {
    return this.clientNetworkCodes.indexOf(clientCode) >= 0 &&
        (authCode === undefined || this.authNetworkCodes.indexOf(authCode) >= 0);
};

NetworkManager.prototype.isValidStandalonePair = function(clientCode, authCode) {
    return this.standaloneNetworkCodes.indexOf(clientCode) >= 0 && authCode === undefined;
};

NetworkManager.prototype.isValidNetworkPair = function(clientCode, authCode) {
    return this.isValidClientPair(clientCode, authCode) || this.isValidStandalonePair(clientCode, authCode);
};
