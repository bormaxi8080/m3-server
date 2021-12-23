var _ = require('lodash');

var utils = require('../utils');
var localeUtils = require('../locale/localeUtils.js');

var Cache = require('../cache/cache.js');
var DataWrapper = require('../game/dataWrapper');

var DefInstance = module.exports = function(data, changes) {
    var self = this;

    this.data = new DataWrapper(data);
    if (changes) {
        _.each(changes, function(v, k) { self.data.set(k, v); });
    }
    localeUtils.iterateKeys(this.data.raw, null, function(path, key) {
        self.data.set(path, key);
    });
    this.data.readonly = true;

    this.cache = this.buildCache();

    this.hash = utils.hashObject(this.data.raw);
};

DefInstance.prototype.buildCache = function() {
    return new Cache(this.data);
};
