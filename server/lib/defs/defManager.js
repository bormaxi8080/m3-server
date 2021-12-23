var _ = require('lodash');

var clone = require('node-v8-clone').clone;

var async = require('async');
var path = require('path');
var utils = require('../utils');

var DataWrapper = require('../game/dataWrapper');
var DefInstance = require('./defInstance');

var MapManager = require('./mapManager');

var DefManager = module.exports = function(core) {
    this.core = core;
    this.mapManager = new MapManager(this.core);

    this.baseDefs = DefManager.requireDefsDir();
    this.groups = utils.requireDir(path.join(__dirname, '../../groups'));
    this.defs = {};
};

DefManager.loadStaticDefs = function() {
    return new DataWrapper(DefManager.requireDefsDir(), {readonly: true});
};

DefManager.loadStaticCache = function() {
    var defInstance = new DefInstance(DefManager.requireDefsDir());
    return defInstance.buildCache();
};

DefManager.requireDefsDir = function() {
    return utils.requireDir(path.join(__dirname, '../../defs'), {nested: true, exclude: ['schema']});
};

DefManager.prototype.importMap = function(map, callback) {
    this.mapManager.writeDatabaseMap(map, callback);
};

DefManager.prototype.mapscreen = function(callback) {
    callback(null, this.mapManager.map.mapscreenBuffer);
};

DefManager.prototype.reload = function(callback) {
    var self = this;

    async.waterfall([
        function(cb) { self.mapManager.reload(cb); },
        function(results, cb) {
            self.baseDefs.map = {
                levels: results.levels,
                bonus_levels: results.bonus_levels,
                chapter_counter: results.chapterCounter,
                level_counter: results.levelCounter
            };
            self.baseDefs.mapscreen = results.mapscreen;
            self.baseDefs.locales = self.core.localeManager.getLocaleHashes();

            self.defs.default = new DefInstance(clone(self.baseDefs, true));
            _.each(self.groups, function(changes, groupName) {
                self.defs[groupName] = new DefInstance(clone(self.baseDefs, true), changes);
            });

            cb();
        },
        function(cb) { self.writeDefsCaches(cb); },
        function(cb) { self.core.localeManager.writeLocaleCaches(cb); }
    ], callback);
};

DefManager.prototype.export = function() {
    return _.reduce(this.defs, function(memo, def, groupName) {
        memo[groupName] = def.data.raw;
        return memo;
    }, {});
};

DefManager.prototype.writeDefsCaches = function(callback) {
    var self = this;
    async.eachLimit(Object.keys(self.defs), 10, function(groupName, cb) {
        var defInstance = self.defs[groupName];
        self.core.defCacher.writeDefsCache(defInstance.hash, defInstance.data.raw, cb);
    }, callback);

};
