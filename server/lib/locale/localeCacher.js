var _ = require('lodash');
var async = require('async');

var LocaleCacher = module.exports = function(core) {
    this.core = core;
};

LocaleCacher.prototype.redisLocaleKey = function(hash) {
    return "locale:" + hash;
};

LocaleCacher.prototype.writeLocaleCache = function(hash, locale, callback) {
    this.core.redis.set(this.redisLocaleKey(hash), JSON.stringify(locale), callback);
};

LocaleCacher.prototype.fetchLocaleCache = function(hash, callback) {
    this.core.redis.get(this.redisLocaleKey(hash), callback);
};
