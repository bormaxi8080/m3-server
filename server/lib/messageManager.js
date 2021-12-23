var async = require('async');
var _ = require('lodash');
var Journal = require('./journal');

var MessageManager = module.exports = function(core) {
    this.core = core;
};

MessageManager.makeMessage = function(userId, fromUserId, type, params) {
    return {
        user_id: userId,
        data: {
            from_user_id: fromUserId,
            type: type,
            params: params
        }
    };
};
MessageManager.prototype.makeMessage = MessageManager.makeMessage;

MessageManager.prototype.redisLastTimeKey = function(userId) {
    return 'usermess:last_ts:' + userId;
};

MessageManager.prototype.getLastTime = function(userId, callback) {
    this.core.redis.get(this.redisLastTimeKey(userId), function(err, val) {
        callback(err, (val ? parseInt(val) : 0));
    });
};

MessageManager.prototype.updateLastTime = function(userId, callback) {
    this.core.redis.set(this.redisLastTimeKey(userId), Date.now(), callback);
};

MessageManager.prototype.sendMessages = function(messages, trx, callback) {
    var self = this;

    var extendMessObj = {
        is_readed: false,
        created_at: new Date()
    };

    var messagesBySahrds = _.chain(messages).map(function(mess) {
        return _.extend(mess, extendMessObj);
    }).groupBy(function(mess) {
        return trx.shardFor(mess.user_id);
    }).value();

    var queriesByShards = _.reduce(messagesBySahrds, function(memo, msgs, shardId) {
        memo[shardId] = function(knex, cb) {
            knex('messages')
            .insert(msgs)
            .exec(cb);
        };
        return memo;
    }, {});

    var tasks = [ function(cb) { trx.execByShards(queriesByShards, cb); } ];

    tasks.push.apply(tasks, _.unique(_.pluck(messages, 'user_id')).map(function(toUserId) {
        return function(cb) { self.updateLastTime(toUserId, cb); };
    }));
    async.parallel(tasks, callback);
};

MessageManager.prototype.readMessages = function(userId, messagesIds, trx, callback) {
    var self = this;
    if (!Array.isArray(messagesIds)) {
        messagesIds = [messagesIds];
    }
    trx.execForKey(userId, function(knex, cb) {
        async.waterfall([
            function(cb) {
                knex('messages')
                .whereIn('id', messagesIds)
                .andWhere('user_id', userId)
                .andWhere('is_readed', false)
                .update({
                    is_readed: true,
                    readed_at: new Date()
                })
                .exec(cb);
            },
            function(cnt, cb) {
                self.updateLastTime(userId, function(err) {
                    cb(err, cnt);
                });
            }
        ], cb);
    }, function(err, cnt) {
        Journal.event('read_messages', {user: userId, cnt: cnt, ids: messagesIds});
        callback(err);
    });
};

MessageManager.prototype.getUnreadMessages = function(userId, trx, callback) {
    trx.execForKey(userId, function(knex, cb) {
        knex('messages')
        .where({user_id: userId, is_readed: false})
        .select('id', 'user_id', 'data', 'created_at')
        .exec(function(err, messages) {
            if (!err) {
                messages = _.map(messages, function(mess) {
                    var dt = new Date(mess.created_at)
                    return {
                        id: mess.id,
                        user_id: mess.user_id,
                        from_user_id: mess.data.from_user_id,
                        type: mess.data.type,
                        params: mess.data.params,
                        created_at: dt.valueOf()
                    }
                });
            }
            cb(err, messages);
        });
    }, callback);
};
