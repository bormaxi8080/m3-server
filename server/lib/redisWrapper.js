var redis = require('redis');

var RedisWrapper = module.exports = function(redisClient, logger) {
    this.client = redisClient;
    this.logger = logger;
};

RedisWrapper.createClient = function(port, host, logger) {
    return new this(redis.createClient(port, host), logger);
};

RedisWrapper.prototype.end = function() {
    this.logger.info("REDIS END");
    this.client.end();
};

RedisWrapper.prototype.flushall = function(callback) {
    this.logger.info("REDIS FLUSHALL");
    this.client.flushall(callback);
};

RedisWrapper.prototype.set = function(key, value, callback) {
    this.logger.info("REDIS SET " + key + " " + value);
    this.client.set(key, value, callback);
};

RedisWrapper.prototype.get = function(key, callback) {
    this.logger.info("REDIS GET " + key);
    this.client.get(key, callback);
};

RedisWrapper.prototype.hmset = function(key, value, callback) {
    this.logger.info("REDIS HMSET " + key + " " + JSON.stringify(value));
    this.client.hmset(key, value, callback);
};

RedisWrapper.prototype.hdel = function(key, field, callback) {
    this.logger.info("REDIS HDEL " + key + " " + field);
    this.client.hdel(key, field, callback);
};

RedisWrapper.prototype.hgetall = function(key, callback) {
    this.logger.info("REDIS HGETALL " + key);
    this.client.hgetall(key, callback);
};

RedisWrapper.prototype.del = function(key, callback) {
    this.logger.info("REDIS DEL " + key);
    this.client.del(key, callback);
};

RedisWrapper.prototype.smembers = function(key, callback) {
    this.logger.info("REDIS SMEMBERS " + key);
    this.client.smembers(key, callback);
};

RedisWrapper.prototype.sadd = function(key, velue, callback) {
    this.logger.info("REDIS SADD " + key + " " + JSON.stringify(value));
    this.client.sadd(key, value, callback);
};
