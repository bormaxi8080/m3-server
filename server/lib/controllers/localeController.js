var Controller = require('../net/controller');

LocaleController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser
    ];
});

LocaleController.prototype.handle = function(task, callback) {
    var reply = function(err, data) {
        if (err) {
            task.error("LocaleController error: ", {error: err});
        } else {
            task.replyJSON(200, data);
        }
        return callback();
    };

    if (!task.query.hash) {
        if (this.inProduction) {
            reply("hash_missing");
        } else {
            if (task.query.code && this.core.localeManager) {
                this.core.localeManager.getById(task.query.code, reply);
            } else {
                reply("hash_missing");
            }
        }
    } else {
        this.core.localeCacher.fetchLocaleCache(task.query.hash, reply);
    }
};
