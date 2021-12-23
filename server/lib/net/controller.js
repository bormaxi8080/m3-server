var util = require('util');
var async = require('async');

var Controller = module.exports = function(fn) {
    util.inherits(fn, Controller);
    return fn;
};

Controller.prototype.process = function(task, callback) {
    var self = this;
    async.waterfall([
        function(cb) { self.before(task, cb); },
        function(cb) { self.handle(task, cb); },
        function(cb) { self.after(task, cb); }
    ], function(err) {
        if (err) {
            task.error(err);
        }
        callback();
    });
};

Controller.prototype.before = function(task, callback) {
    async.eachSeries(this.middleware || [], function(middleware, cb) {
        if (middleware.before) {
            middleware.before(task, cb);
        } else {
            cb();
        }
    }, callback);
};

Controller.prototype.after = function(task, callback) {
    async.eachSeries(this.middleware || [], function(middleware, cb) {
        if (middleware.after) {
            middleware.after(task, cb);
        } else {
            cb();
        }
    }, callback);
};
