var Controller = require('../../net/controller');

LevelsQueryController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator
    ];
});

LevelsQueryController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("LevelsQueryController error: " + err, {error: "data_error"});
        } else {
            task.reply(200, {}, data ? data : {});
        }
        return callback();
    };

    this.core.levelManager.fetchLevels(task.session.user, task.post.levels, this.core.multiKnex, reply);
};
