var _ = require('lodash');
var DefInstance = require('./defInstance');

var DefKeeper = module.exports = function(defsByGroups) {
    this.defsByGroups = DefKeeper.parseDefs(defsByGroups || {default: {}});
};

DefKeeper.parseDefs = function(defsByGroups) {
    return _.reduce(defsByGroups, function(memo, data, groupName) {
        memo[groupName] = new DefInstance(data);
        return memo;
    }, {});
};

DefKeeper.prototype.import = function(defsByGroups) {
    this.defsByGroups = DefKeeper.parseDefs(defsByGroups);
    if (this.onImport) {
        this.onImport();
    }
};

DefKeeper.prototype.defInstance = function(playerState) {
    return this.defsByGroups[playerState.group] || this.defsByGroups.default;
};

DefKeeper.prototype.defs = function(playerState) {
    return this.defInstance(playerState).data;
};

DefKeeper.prototype.cache = function(playerState) {
    return this.defInstance(playerState).cache;
};

DefKeeper.prototype.defsHash = function(playerState) {
    return this.defInstance(playerState).hash;
};

DefKeeper.prototype.defByHash = function(hash) {
    return _.find(defsByGroups, function(defInstance) {
        return defInstance.hash === hash;
    });
};

DefKeeper.prototype.defHashes = function() {
    return _.map(defsByGroups, function(defInstance) {
        return defInstance.hash;
    });
};
