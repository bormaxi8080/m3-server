var _ = require('lodash');
var async = require('async');

var Controller = require('../net/controller');

CommandController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator,
        core.middleware.journalCollector
    ];
});

CommandController.prototype.handle = function(task, callback) {
    if (!task.post.commands) {
        return callback({error: 'commands_error'});
    }

    if (!_.isArray(task.post.commands)) {
        return callback({error: 'commands_error'});
    }

    var self = this;
    async.series([
        function(cb) { self.core.commandProcessor.process(task.session.user, task.post.commands, cb); },
        function(cb) { self.core.messageManager.getLastTime(task.session.user, cb); }
    ], function(err, results) {
        if (err) {
            task.error("CommandController error: " + JSON.stringify(err), {error: "data_error"});
            if (err.stack) {
                self.core.logger.warn(err.stack);
            }
        } else {
            var response = _.extend(results[0], {
                last_messages_time: results[1],
                server: {
                    time: Date.now()
                }
            });
            task.replyJSON(200, response);
        }
        callback();
    });
};
