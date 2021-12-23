var async = require('async');
var Controller = require('../../net/controller');

var UnreadMessagesController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator,
        core.middleware.journalCollector
    ];
});

UnreadMessagesController.prototype.handle = function(task, callback) {
    var core = this.core;
    var reply = function(err, data) {
        if (err) {
            task.error("UnreadMessagesController error: " + err, {error: "data_error"});
        } else {
            task.reply(200, {}, data);
        }
        return callback();
    };
    async.parallel({
        messages: function(cb) {
            core.messageManager.getUnreadMessages(task.session.user, core.multiKnex, cb);
        },
        last_messages_time: function(cb) {
            core.messageManager.getLastTime(task.session.user, cb);
        }
    }, reply);
};
