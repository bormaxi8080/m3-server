var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

FetchInvitesController = module.exports = Controller(function(core) {
    this.core = core;
    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator,
    ];
});

FetchInvitesController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("FetchInvitesController error: ", {error: err.message});
        } else {
            task.reply(200, {}, data);
        }
        return callback();
    };
    this.core.inviteManager.fetchInvites(task.post.network_code, task.session.user, this.core.multiKnex, reply);
};
