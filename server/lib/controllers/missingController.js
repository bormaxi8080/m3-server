var Controller = require('../net/controller');

MissingController = module.exports = Controller(function(core) {
    this.core = core;
});

MissingController.prototype.handle = function(task, callback) {
    var text = "No handler found for " + task.request.url + "!";
    task.reply(404, {"Content-Type": "text/html"}, text);
    this.core.logger.warn(text);
    callback();
};
