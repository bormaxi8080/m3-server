var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

StoreInvitesController = module.exports = Controller(function(core) {
    this.core = core;
    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator,
    ];
});

StoreInvitesController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("StoreInvitesController error: ", {error: err.message});
        } else {
            task.reply(200, {}, data);
        }
        return callback();
    };

    var cache = this.core.defKeeper.defsByGroups.default.cache;

    var data = null;
    var byAction = !!task.post.by_action;
    if (byAction) {
        var effect = cache.actionsCache.getInviteEffect(Date.now());
        if (effect.reward) {
            data = {reward: effect.reward};
        }
    }
    this.core.inviteManager.storeInvites(task.session.user, task.post.network_code, task.post.network_ids, data, reply);
};
