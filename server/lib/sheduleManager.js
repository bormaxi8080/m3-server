var path = require('path');
var utils = require('./utils');
var async = require('async');
var _ = require('lodash');

var SheduleManager = module.exports = function(core) {
    this.core = core;
    this.redis = core.redis;
    var tasks = utils.requireInstances(this.core, path.join(__dirname, 'shedules'));
    this.tasks = _.indexBy(tasks, 'code');
};

SheduleManager.prototype.getRedisNextExecKey = function(code) {
    return 'shed:nextexec:' + code;
};

SheduleManager.prototype.getRedisDateKey = function(code, origd) {
    var period = this.tasks[code].period;
    var secs = origd.valueOf() / 1000;
    secs = (Math.floor(secs / period) * period);
    return utils.formatDate(new Date(secs * 1000), 'shed:date:%Y:%m:%d:%H:%M:%S');
};

SheduleManager.prototype.setImmediateKeyHash = function(code, key, value, callback) {
    var period = this.tasks[code].period;
    var d = new Date();
    d.setSeconds( d.getSeconds() + period );
    this.setSheduleKeyHash(code, d, key, value, callback);
}

SheduleManager.prototype.setSheduleKeyHash = function(code, time, key, value, callback) {
    var redisKey = this.getRedisDateKey(code, time);
    var hash = {};
    hash[key] = value;
    this.redis.hmset(redisKey, hash, callback);
};

SheduleManager.prototype.delSheduleKeyHash = function(code, time, key, callback) {
    var redisKey = this.getRedisDateKey(code, time);
    this.redis.hdel(redisKey, key, callback);
};

SheduleManager.prototype.getHashByDate = function(code, date, callback) {
    var dateKey = this.getRedisDateKey(code, date);
    this.redis.hgetall(dateKey, callback);
};

SheduleManager.prototype.delHashByDate = function(code, date, callback) {
    var dateKey = this.getRedisDateKey(code, date);
    this.redis.del(dateKey, callback);
};

SheduleManager.prototype.getNextExecDate = function(code, callback) {
  var nextExecKey = this.getRedisNextExecKey(code);
    this.redis.get(nextExecKey, function(err, redisDate) {
        callback(err, redisDate ? (new Date(redisDate)) : new Date(Date.now() - 10));
    });
};

SheduleManager.prototype.setNextExecDate = function(code, prevDate, period, callback) {
    var nextExecKey = this.getRedisNextExecKey(code);
    var secs = prevDate.valueOf() / 1000;
    secs = (Math.floor(secs / period) * period) + period;
    this.redis.set(nextExecKey, new Date(secs * 1000), callback);
};

SheduleManager.prototype.checkSheduleTasks = function(task) {
    var self = this;
    async.waterfall([
        function(cb) { self.getNextExecDate(task.code, cb); },
        function(nextExecDate, cb) {
            var curDate = new Date();
            if (curDate < nextExecDate) {
                return cb(null, 'empty run');
            }
            async.waterfall([
                function(cb) { self.getHashByDate(task.code, nextExecDate, cb); },
                function(hash, cb) {
                    if (hash) {
                        task.exec(hash, cb);
                    } else {
                        cb(null, 'no data for task');
                    }
                },
                function(result, cb) {
                    self.delHashByDate(task.code, nextExecDate, function() {});
                    self.setNextExecDate(task.code, nextExecDate, task.period, function(err) {
                        cb(err, result);
                    });
                }
            ], cb);
        }
    ], function(err, result) {
        self.core.logger.info('Finish task ' + task.code + ' ' + JSON.stringify(result));
    });
};

SheduleManager.prototype.start = function(period) {
    var self = this;
    setInterval(function() {
        _.each(self.tasks, function(task) {
            self.checkSheduleTasks(task);
        });
    }, period);
};
