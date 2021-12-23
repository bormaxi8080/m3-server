var Controller = require('../../net/controller');

UsersQueryController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.tokenValidator,
        core.middleware.sessionValidator
    ];
});

UsersQueryController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("UsersQueryController error: " + err, {error: "data_error"});
        } else {
            task.reply(200, {}, data);
        }
        return callback();
    };

    this.core.networkManager.fetchNetworksByCredentials(task.post.credentials, this.core.multiKnex, reply);
};
