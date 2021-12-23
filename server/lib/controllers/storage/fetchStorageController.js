var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

FetchStorageController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator
    ];
});

FetchStorageController.prototype.handle = function(task, callback) {
    var self = this;
    if (!task.post.storage) {
        task.reply(200, {}, {error: 'storage_missing'});
        return callback();
    }

    var network = {
        network_code: task.session.client_code,
        network_id: task.session.client_id,
    };

    this.core.networkStorage.fetchStorage(network, function(err, storage) {
        if (err) {
            task.controllerError("FetchStorageController", 200, err, 'storage_error');
            return callback();
        }

        if (storage.storage_session !== task.post.storage) {
            task.reply(200, {}, {error: 'incorrect_storage'});
        } else {
            task.reply(200, {}, {data: storage.data});
        }
        return callback();
    });
};
