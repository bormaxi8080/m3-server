var _ = require('lodash');
var async = require('async');

var Map = require('./map');

var MapManager = module.exports = function(core) {
    this.core = core;
};

MapManager.prototype.writeDatabaseMap = function(map, callback) {
    this.core.standaloneKnex
    .insert({data: map, created_at: new Date()})
    .into('map')
    .exec(callback);
};

MapManager.prototype.fetchDatabaseMap = function(callback) {
    this.core.standaloneKnex
    .select()
    .from('map')
    .orderBy('id', 'desc')
    .limit(1)
    .exec(callback);
};

MapManager.prototype.reload = function(callback) {
    var self = this;
    async.waterfall([
        function(cb) { self.fetchDatabaseMap(cb); },
        function(rows, cb) {
            if (!rows.length) {
                return cb("No map config found in database");
            }
            var map = new Map(rows[0].data);
            self.writeMapCaches(map, function(err) {
                self.map = map;
                cb(err, map);
            });
        },
    ],  callback);
};

MapManager.prototype.writeMapCaches = function(map, callback) {
    var self = this;
    async.parallel([
        function(cb) {
            async.eachLimit(Object.keys(map.levelHashes), 30, function(hash, cb) {
                self.core.defCacher.writeLevelCache(hash, map.levelHashes[hash], cb);
            }, cb);
        },
        function(cb) {
            async.eachLimit(Object.keys(map.chapterHashes), 10, function(hash, cb) {
                self.core.defCacher.writeChapterCache(hash, map.chapterHashes[hash], cb);
            }, cb);
        }
    ], callback);
};
