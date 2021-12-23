var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

LevelMapController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser
    ];
});

LevelMapController.prototype.handle = function(task, callback) {
    var self = this;

    if (!task.query.hash) {
        task.error({error: "hash_missing"});
        return callback();
    }

    async.waterfall([
        function(cb) { self.core.defCacher.fetchLevelCache(task.query.hash, cb); }
    ], function(err, level) {
        if (err) {
            task.error("LevelMapController error: " + err, {error: "database_error"});
        } else if (!level) {
            task.error({error: "level_not_found"});
        } else {
            task.replyJSON(200, level);
        }
        callback();
    });
};
