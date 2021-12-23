var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

var UpdateSessionController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator,
        core.middleware.authorizer,
        core.middleware.journalCollector
    ];
});

UpdateSessionController.prototype.handle = function(task, callback) {
    var self = this;
    var sessionId = task.post.session_id;

    var reply = function(err, sessionId) {
        if (err) {
            task.error("UpdateSessionController error: " + JSON.stringify(err), err.error ? err : {error: "session_error"});
        } else {
            Journal.event('session_update', {client: [
                task.session.client_code,
                task.session.client_id
            ], auth: [
                task.session.auth_code,
                task.session.auth_id
            ]});
            task.reply(200, {}, {session: sessionId});
        }

        return callback();
    };

    if (task.post.auth_network) {
        var authNetwork = _.pick(task.post.auth_network, ['network_code', 'network_id']);
        if (this.sessionAuthRequiresUpdate(task.session, authNetwork)) {
            return this.updateAuth(task, sessionId, task.session, authNetwork, reply);
        } else {
            return reply(null, sessionId);
        }
    } else  {
        this.dropAuth(task, sessionId, task.session, reply);
    }
};

UpdateSessionController.prototype.updateAuth = function(task, sessionId, session, authNetwork, callback) {
    var self = this;
     async.waterfall([
        function(cb) { self.core.networkManager.fetchUserIdByNetwork(authNetwork, cb); },
        function(otherUserId, cb) {
            if (!otherUserId) {
                self.core.networkManager.activateNewNetwork(authNetwork, session.user, self.core.multiKnex, function(err) {
                    cb(err, session.user);
                });
            } else if (otherUserId === session.user) {
                cb(null, session.user);
            } else {
                self.core.userManager.tryMerge(session.user, otherUserId, cb);
            }
        },
        function(userId, cb) {
            task.userId = userId;
            task.session.auth_code = authNetwork.network_code;
            task.session.auth_id = authNetwork.network_id;
            self.core.sessionManager.updateSession(sessionId, {
                auth_code: authNetwork.network_code,
                auth_id: authNetwork.network_id
            }, cb);
        }
    ], callback);
};

UpdateSessionController.prototype.dropAuth = function(task, sessionId, session, callback) {
    task.session.auth_code = session.client_code;
    task.session.auth_id = session.client_id;
    this.core.sessionManager.updateSession(sessionId, {
        auth_code: session.client_code,
        auth_id: session.client_id
    }, callback);
};

UpdateSessionController.prototype.sessionAuthRequiresUpdate = function(session, authNetwork) {
    return session.auth_code !== authNetwork.network_code || session.auth_id !== authNetwork.network_id;
};
