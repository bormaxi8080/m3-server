var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var Controller = require('../net/controller');

StaticController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser
    ];

    this.cache = {};
    this.path = path.join(process.env.SERVER_PATH, 'static');
});

StaticController.prototype.handle = function(task, callback) {
    if (task.path in this.cache) {
        task.reply(200, {}, this.cache[task.path]);
    } else {
        var fileName = task.path.replace(/^\/static\//, '').replace('../', '').replace(/\/$/, '');

        var filePath = path.join(this.path, fileName);

        if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
            task.reply(200, {}, this.cache[task.path] = fs.readFileSync(filePath).toString());
        } else {
            task.reply(404, {}, "File not Found");
        }
    }
    callback();
 };
