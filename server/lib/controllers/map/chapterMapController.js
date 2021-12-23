var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

ChapterMapController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser
    ];
});

ChapterMapController.prototype.handle = function(task, callback) {
    var self = this;

    if (!task.query.hash) {
        task.error({error: "hash_missing"});
        return callback;
    }

    async.waterfall([
        function(cb) { self.core.defCacher.fetchChapterCache(task.query.hash, cb); }
    ], function(err, chapter) {
        if (err) {
            task.error("ChapterMapController error: " + err, {error: "database_error"});
        } else if (!chapter) {
            task.error({error: "chapter_not_found"});
        } else {
            task.replyJSON(200, chapter);
        }
        callback();
    });
};
