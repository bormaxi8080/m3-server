var _ = require('lodash');
var async = require('async');

var Journal = require('../../journal');
var Controller = require('../../net/controller');

GetSessionController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.authorizer,
        core.middleware.journalCollector
    ];
});

GetSessionController.prototype.filterNetwork = function(obj) {
    return _.pick(obj, ['network_code', 'network_id']);
};

GetSessionController.prototype.handle = function(task, callback) {
    var self = this;

    this.createSession(task, task.post.client_network, task.post.auth_network, function(err, userId, sessionId, session) {
        if (err) {
            if (err.stack) {
                console.log(err.stack);
            }
            task.error("GetSessionController error: " + JSON.stringify(err), err.error ? err : {error: "session_error"});
        } else {
            task.reply(200, {}, {session: sessionId});
        }
        return callback();
    });
};

GetSessionController.prototype.createSession = function(task, clientNetwork, authNetwork, callback) {
    var self = this;
    var filteredAuthNetwork = this.filterNetwork(authNetwork);
    var filteredClientNetwork = this.filterNetwork(clientNetwork);
    var onSuccess = function(err, userId, sessionId, session) {
        if (err) {
            return callback(err);
        }

        task.session = session;
        task.userId = userId;
        task.sessionId = sessionId;
        Journal.event('session_create', session);
        callback(err, userId, sessionId, session);
    };

    if (authNetwork) {
        this.createAuthenticatedSession(filteredClientNetwork, filteredAuthNetwork, onSuccess);
    } else {
        this.createSimpleSession(filteredClientNetwork, onSuccess);
    }
};

GetSessionController.prototype.formatSessionObject = function(userId, clientNetwork, authNetwork) {
    return {
        user: userId,
        client_code: clientNetwork.network_code,
        client_id: clientNetwork.network_id,
        auth_code: authNetwork.network_code,
        auth_id: authNetwork.network_id
    };
};

GetSessionController.prototype.createSimpleSession = function(clientNetwork, callback) {
    clientNetwork = this.filterNetwork(clientNetwork);
    var self = this;
    var session = null;
    var userId = null;
    async.waterfall([
        function(cb) {
            self.core.networkManager.fetchUserIdByNetwork(clientNetwork, cb);
        },
        function(userId, cb) {
            if (!userId) {
                self.core.userManager.create(clientNetwork, cb);
            } else {
                cb(null, userId);
            }
        },
        function(foundUserId, cb) {
            userId = foundUserId;
            session = self.formatSessionObject(userId, clientNetwork, clientNetwork);
            self.core.sessionManager.createSession(session, cb);
        }
    ], function(err, sessionId) {
        callback(err, userId, sessionId, session);
    });
};

GetSessionController.prototype.createAuthenticatedSession = function(clientNetwork, authNetwork, callback) {
    clientNetwork = this.filterNetwork(clientNetwork);
    authNetwork = this.filterNetwork(authNetwork);
    var self = this;
    var userId = null;
    var session = null;
    async.waterfall([
        function(cb) {
            async.parallel([
                function(cb) { self.core.networkManager.fetchUserIdByNetwork(clientNetwork, cb); },
                function(cb) { self.core.networkManager.fetchUserIdByNetwork(authNetwork, cb); }
            ], cb);
        },
        function(results, cb) {
            var deviceUserId = results[0];
            var authUserId = results[1];
            if (deviceUserId && authUserId) {
                if (deviceUserId === authUserId) {
                    cb(null, deviceUserId);
                } else {
                    self.core.userManager.tryMergeOrSelect(deviceUserId, authUserId, cb);
                }
            } else {
                if (!deviceUserId && !authUserId) {
                    self.core.userManager.create(clientNetwork, function(err, newUserId) {
                        if (err) { return cb(err); }
                        self.core.networkManager.activateNewNetwork(authNetwork, newUserId, self.core.multiKnex, function(err) {
                            cb(err, newUserId);
                        });
                    });
                } else if (authUserId) {
                    self.core.networkManager.activateNewNetwork(clientNetwork, authUserId, self.core.multiKnex, function(err) {
                        cb(err, authUserId);
                    });
                } else {
                    self.core.networkManager.activateNewNetwork(authNetwork, deviceUserId, self.core.multiKnex, function(err) {
                        cb(err, deviceUserId);
                    });
                }
            }
        },
        function(foundUserId, cb) {
            userId = foundUserId;
            session = self.formatSessionObject(userId, clientNetwork, authNetwork);
            self.core.sessionManager.createSession(session, cb);
        }
    ], function(err, sessionId) {
        callback(err, userId, sessionId, session);
    });
};
