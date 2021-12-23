var _ = require('lodash');
var async = require('async');
var uuid = require('node-uuid');

var NetworkStorage = module.exports = function(core) {
    this.core = core;
};

NetworkStorage.prototype.shardingKey = function(network) {
    return network.network_code + "_" + network.network_id;
};

NetworkStorage.prototype.ensureStorage = function(networkCode, networkId, callback) {
    var now = new Date();
    var self = this;
    var storage = null;
    var sessionId = null;
    var newStorageSession = uuid.v4();
    var network = {
        network_code: networkCode,
        network_id: networkId
    };
    async.waterfall([
        function(cb) { self.fetchStorage(network, cb); },
        function(foundStorage, cb) {
            if (foundStorage) {
                storage = foundStorage;
                cb(null, storage.client_session);
            } else {
                self.core.controllers.getSessionController.createSession(self.core.getDomainTask(), network, null, function(err, userId, sessionId, session) {
                    cb(err, sessionId);
                });
            }
        },
        function(foundSessionId, cb) {
            sessionId = foundSessionId;
            if (storage) {
                self.updateStorage(network, {storage_session: newStorageSession}, cb);
            }  else {
                storage = _.merge(network, {
                    storage_session: newStorageSession,
                    client_session: sessionId
                });
                self.createStorage(storage, cb);
            }
        }
    ], function(err) {
        callback(err, newStorageSession, sessionId);
    });
};

NetworkStorage.prototype.fetchStorage = function(network, callback) {
    this.core.multiKnex.execForKey(this.shardingKey(network), function(knex, cb) {
        knex('storage')
        .select('storage_session', 'client_session', 'data')
        .where(network)
        .exec(cb);
    }, function(err, result) {
        callback(err, result ? result[0] : result);
    });
};

NetworkStorage.prototype.createStorage = function(storage, callback) {
    this.core.multiKnex.execForKey(this.shardingKey(storage), function(knex, cb) {
        knex('storage')
        .insert(_.merge(storage, {
            updated_at: new Date(),
            data: {}
        }))
        .exec(cb);
    }, callback);
};

NetworkStorage.prototype.updateStorage = function(network, storage, callback) {
    this.core.multiKnex.execForKey(this.shardingKey(network), function(knex, cb) {
        knex('storage')
        .update(_.merge(storage, {updated_at: new Date()}))
        .where(network)
        .exec(cb);
    }, callback);
};

NetworkStorage.prototype.updateStorageDataBySession = function(network, storageSession, data, callback) {
    this.core.multiKnex.execForKey(this.shardingKey(network), function(knex, cb) {
        knex('storage')
        .update({data: data, updated_at: new Date()})
        .where({storage_session: storageSession})
        .exec(cb);
    }, callback);
};
