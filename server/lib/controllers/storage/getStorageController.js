var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

GetStorageController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.authorizer,
        core.middleware.journalCollector
    ];
});

GetStorageController.prototype.storagebleNetworks = ['MM', 'VK', 'FB', 'OK'];

GetStorageController.prototype.handle = function(task, callback) {
    var self = this;
    var networkCode = task.post.client_network.network_code;
    var networkId = task.post.client_network.network_id;

    if (this.storagebleNetworks.indexOf(networkCode) < 0) {
        task.reply(200, {}, {error: 'incorrect_client_network'});
        return callback();
    }

    this.core.networkStorage.ensureStorage(networkCode, networkId, function(err, newStorageSession, sessionId) {
        if (err) {
            task.controllerError("GetStorageController", 200, err, 'storage_error');
            return callback();
        }

        task.reply(200, {}, {
            session: sessionId,
            storage: newStorageSession
        });
        return callback();
    });
};
