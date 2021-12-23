var _ = require('lodash');

var Controller = require('../../net/controller');

UsersTimeQueryController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator
    ];
});

UsersTimeQueryController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("UsersTimeQueryController error: " + err, {error: "data_error"});
        } else {
            task.reply(200, {}, _.reduce(data, function(result, fields) {
                result[fields.id] = {
                    last_activity: Date.parse(fields.updated_at),
                    finish_level_time: fields.finish_level_time ? Date.parse(fields.finish_level_time) : null
                };
                return result;
            }, {}));
        }
        return callback();
    };

    this.core.userManager.fetchUsersColumns(task.post.users, ['updated_at', 'finish_level_time'], this.core.multiKnex, reply);
};
