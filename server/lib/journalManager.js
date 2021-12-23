var _ = require('lodash');
var async = require('async');

var JournalManager = module.exports = function(core) {
    this.core = core;
};

JournalManager.prototype.write = function(userId, sessionId, storedEvents, callback) {
    if (_.isEmpty(storedEvents)) {
        return callback();
    }
    this.core.journalManager.writeDatabaseEvents(userId, sessionId, storedEvents, callback);
};

JournalManager.prototype.writeDatabaseEvents = function(userId, sessionId, storedEvents, callback) {
    var now = new Date();
    var self = this;

    this.core.multiKnex.execForKey(userId, function(knex, cb) {
        knex('journal')
        .insert(storedEvents.map(function(event) {
            return {
                user_id: userId,
                session_id: sessionId,
                created_at: now,
                type: event[0],
                event: event[1]
            };
        }))
        .exec(cb);
    }, callback);
};

JournalManager.prototype.transferJournal = function(fromUser, toUser, trx, callback) {
    var self = this;
    var fromShard = trx.shardFor(fromUser);
    var toShard = trx.shardFor(toUser);
    if (fromShard === toShard) {
        self.changeDatabaseEventsOwner(fromUser, toUser, trx, callback);
    } else {
        async.waterfall([
            function(cb) { self.fetchDatabaseEvents(fromUser, trx, cb); },
            function(events, cb) { self.transferDatabaseEvents(events, fromUser, toUser, trx, cb); }
        ], callback);
    }
};

JournalManager.prototype.fetchDatabaseEvents = function(userId, trx, callback) {
    trx.execForKey(userId, function(knex, cb) {
        var query = knex('journal')
        .select()
        .where({user_id: userId});
        if (query.isTransaction) {
            query = query.forUpdate();
        }
        query.exec(cb);
    }, callback);
};

JournalManager.prototype.changeDatabaseEventsOwner = function(fromUser, toUser, trx, callback) {
    trx.execForShard(trx.shardFor(fromUser), function(knex, cb) {
        knex('journal')
        .where({user_id: fromUser})
        .update({user_id: toUser})
        .exec(cb);
    }, function(err) {
       callback(err);
    });
};

JournalManager.prototype.transferDatabaseEvents = function(events, fromUser, toUser, trx, callback) {
    var queriesByShards = {};
    _.each(events, function(event) {
        event.user_id = toUser;
    });

    if (!events.length) {
        return callback();
    }

    queriesByShards[trx.shardFor(fromUser)] = function(knex, cb) {
        knex('journal')
        .where({user_id: fromUser})
        .del()
        .exec(cb);
    };
    queriesByShards[trx.shardFor(toUser)] = function(knex, cb) {
        knex('journal')
        .insert(events)
        .exec(cb);
    };
    trx.execByShards(queriesByShards, function(err) {
        callback(err);
    });
};
