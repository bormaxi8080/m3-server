var _ = require('lodash');
var async = require('async');

var DefCacher = module.exports = function(core) {
    this.core = core;
};

DefCacher.prototype.redisDefsKey = function(hash) {
    return "defs:" + hash;
};

DefCacher.prototype.writeDefsCache = function(hash, defs, callback) {
    this.core.redis.set(this.redisDefsKey(hash), JSON.stringify(defs), callback);
};

DefCacher.prototype.fetchDefsCache = function(hash, callback) {
    this.core.redis.get(this.redisDefsKey(hash), callback);
};

DefCacher.prototype.redisLevelKey = function(hash) {
    return "ml:" + hash;
};

DefCacher.prototype.redisChapterKey = function(hash) {
    return "mc:" + hash;
};

DefCacher.prototype.writeLevelCache = function(hash, level, callback) {
    this.core.redis.set(this.redisLevelKey(hash), JSON.stringify(level), callback);
};

DefCacher.prototype.writeChapterCache = function(hash, chapter, callback) {
    this.core.redis.set(this.redisChapterKey(hash), JSON.stringify(chapter), callback);
};

DefCacher.prototype.fetchLevelCache = function(hash, callback) {
    this.core.redis.get(this.redisLevelKey(hash), callback);
};

DefCacher.prototype.fetchChapterCache = function(hash, callback) {
    this.core.redis.get(this.redisChapterKey(hash), callback);
};
