var _ = require('lodash');
var async = require('async');
var Controller = require('../net/controller');

InitController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator
    ];
});

InitController.prototype.handle = function(task, callback) {
    var core = this.core;
    var reply = function(err, result) {
        if (err) {
            task.error("InitController error: " + err, {error: "data_error"});
        } else {
            var response = _.extend(result, {
                defs_hash: core.defKeeper.defsHash(result.user_data),
                server: {
                    time: Date.now()
                }
            });
            task.replyJSON(200, response);
        }
        return callback();
    };

    async.parallel({
        user_data: function(cb) {
            core.userManager.fetchUserState(task.session.user, core.multiKnex, cb);
        },
        messages: function(cb) {
            core.messageManager.getUnreadMessages(task.session.user, core.multiKnex, cb);
        },
        last_messages_time: function(cb) {
            core.messageManager.getLastTime(task.session.user, cb);
        }
    }, reply);
};
