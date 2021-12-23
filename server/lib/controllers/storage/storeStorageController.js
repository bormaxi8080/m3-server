var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

StoreStorageController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator
    ];
});

StoreStorageController.prototype.handle = function(task, callback) {
    var self = this;
    if (!task.post.storage) {
        task.reply(200, {}, {error: 'storage_missing'});
        return callback();
    }

    if (!task.post.data) {
        task.reply(200, {}, {error: 'data_missing'});
        return callback();
    }

    var network = {
        network_code: task.session.client_code,
        network_id: task.session.client_id,
    };

    this.core.networkStorage.updateStorageDataBySession(network, task.post.storage, task.post.data, function(err, result) {
        self.core.logger.error("THIS IS A RESULT \n\n");
        self.core.logger.error(result);
        if (err) {
            task.controllerError("StoreStorageController", 200, err, 'storage_error');
            return callback();
        }

        if (result) {
            task.reply(200, {}, {});
        } else {
            task.reply(200, {}, {error: 'incorrect_storage'});
        }
        return callback();
    });
};
