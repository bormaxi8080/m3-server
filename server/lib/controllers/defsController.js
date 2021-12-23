var async = require('async');

var Controller = require('../net/controller');

DefsController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser
    ];
});

DefsController.prototype.handle = function(task, callback) {
    var core = this.core;

    if (!task.query.hash) {
        if (this.inProduction) {
            task.error({error: "hash_missing"});
            return callback();
        } else {
            if (this.core.defKeeper) {
                task.replyJSON(200, this.core.defKeeper.defsByGroups.default.data.raw);
            } else {
                task.error({error: "defs_not_found"});
            }
            return callback();
        }
    }

    async.waterfall([
        function(cb) { core.defCacher.fetchDefsCache(task.query.hash, cb); }
    ], function(err, defs) {
        if (err) {
            task.error("DefsController error: " + err, {error: "database_error"});
        } else if (!defs) {
            task.error({error: "defs_not_found"});
        } else {
            task.replyJSON(200, defs);
        }
        callback();
    });
};
