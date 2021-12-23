var Controller = require('../../net/controller');

UsersLevelsQueryController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator
    ];
});

UsersLevelsQueryController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("UsersLevelsScoresQueryController error: " + err, {error: "data_error"});
        } else {
            task.reply(200, {}, data);
        }
        return callback();
    };

    this.core.levelManager.fetchUsersByLevels(task.post.users, task.post.levels, this.core.multiKnex, reply);
};
