// Note: this is a non-production controller!

var Controller = require('../net/controller');

ResetController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator,
        core.middleware.journalCollector
    ];
});

ResetController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("ResetController error: " + err, {error: "data_error"});
        } else {
            task.reply(200, {}, data);
        }
        return callback();
    };

    this.core.userManager.reset(task.session.user, reply);
};
