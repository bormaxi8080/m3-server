var Controller = require('../../net/controller');

UsersProgressQueryController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator
    ];
});

UsersProgressQueryController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("UsersProgressQueryController error: " + err, {error: "data_error"});
        } else {
            task.reply(200, [], data);
        }
        return callback();
    };

    this.core.userManager.fetchUserColumnByIds(task.post.users, 'progress', this.core.multiKnex, reply);
};
