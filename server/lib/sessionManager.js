var _ = require('lodash');
var uuid = require('node-uuid');
var async = require('async');
var crypto = require('crypto');

var SessionManager = module.exports = function(core) {
    this.core = core;
};

SessionManager.prototype.redisSessionKey = function(sessionId) {
    return 's:' + sessionId;
};

SessionManager.prototype.createSession = function(data, callback) {
    this.writeSession(uuid.v4(), data, this.core.multiKnex, callback);
};

SessionManager.prototype.generateSessionId = function(callback) {
    crypto.randomBytes(16, function(ex, buf) {
        callback(null, buf.toString('hex'));
    });
};

SessionManager.prototype.writeSession = function(sessionId, data, trx, callback) {
    var self = this;
    async.parallel([
        function(cb) { self.writeDatabaseSession(sessionId, data, trx, cb); },
        function(cb) { self.writeRedisSession(sessionId, data, cb); }
    ], function(err) {
        callback(err, sessionId);
    });
};

SessionManager.prototype.writeDatabaseSession = function(sessionId, data, trx, callback) {
    trx.execForKey(data.user, function(knex, cb) {
        knex
        .insert({user_id: data.user, session_id: sessionId})
        .into('sessions')
        .exec(cb);
    }, callback);
};

SessionManager.prototype.writeRedisSession = function(sessionId, data, callback) {
    data.updated = data.updated || Date.now();
    this.core.redis.hmset(this.redisSessionKey(sessionId), data, callback);
};

SessionManager.prototype.fetchSession = function(sessionId, callback) {
    this.core.redis.hgetall(this.redisSessionKey(sessionId), callback);
};

SessionManager.prototype.fetchDatabaseSessions = function(userId, trx, callback) {
    var self = this;
    trx.execForKey(userId, function(knex, cb) {
        var query = knex('sessions')
        .select('session_id')
        .where({user_id: userId});
        if (query.isTransaction) {
            query = query.forUpdate();
        }
        query.exec(cb);
    }, callback);
};

SessionManager.prototype.updateSession = function(sessionId, data, callback) {
    this.writeRedisSession(sessionId, data, function(err) {
        callback(err, sessionId);
    });
};

SessionManager.prototype.transferSessions = function(fromUser, toUser, trx, callback) {
    var self = this;
    async.waterfall([
        function(cb) { self.fetchDatabaseSessions(fromUser, trx, callback); },
        function(sessions) {
            async.parallel([
                function(cb) { self.transferRedisSessions(sessions, toUser, cb); },
                function(cb) { self.transferDatabaseSessions(sessions, fromUser, toUser, trx, cb); }
            ], function(err) {
               callback(err);
            });
        }
    ], callback);
};

SessionManager.prototype.transferRedisSessions = function(sessions, toUser, callback) {
    var self = this;
    async.each(sessions, function(session, cb) {
        self.writeRedisSession(session.session_id, {user: toUser}, cb);
    }, callback);
};

SessionManager.prototype.transferDatabaseSessions = function(sessions, fromUser, toUser, trx, callback) {
    var self = this;
    var fromShard = trx.shardFor(fromUser);
    var toShard = trx.shardFor(toUser);
    if (fromShard === toShard) {
        trx.execForShard(fromShard, function(knex, cb) {
            knex('sessions')
            .where({user_id: fromUser})
            .update({user_id: toUser})
            .exec(cb);
        }, function(err) {
           callback(err);
        });
    } else {
        var queriesByShards = {};
        var sessionsWithUsers = _.map(sessions, function(session) {
            return _.extend(session, {user_id: toUser});
        });
        queriesByShards[fromShard] = function(knex, cb) {
            knex('sessions')
            .where({user_id: fromUser})
            .del()
            .exec(cb);
        };
        queriesByShards[toShard] = function(knex, cb) {
            knex('sessions')
            .insert(sessionsWithUsers)
            .exec(cb);
        };
        trx.execByShards(queriesByShards, function(err) {
            callback(err);
        });
    }
};
