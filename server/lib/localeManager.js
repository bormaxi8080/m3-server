var _ = require('lodash');
var path = require('path');
var utils = require('./utils');
var async = require('async');

var Locale = require('./locale/locale');

var LocaleManager = module.exports = function(core) {
    this.core = core;
    var localeContents = utils.requireDir(path.join(__dirname, '../locale'), {nested: false});
    this.locales = _.reduce(localeContents, function(memo, data, name) {
        memo[name] = new Locale(data);
        return memo;
    }, {});
};

LocaleManager.prototype.getById = function(localeId, callback) {
    if (this.locales[localeId]) {
        callback(null, this.locales[localeId].data);
    } else {
        callback("unknown_locale");
    }
};

LocaleManager.prototype.getLocaleHashes = function() {
    return _.reduce(this.locales, function(memo, locale, localeName) {
        memo[localeName] = locale.hash;
        return memo;
    }, {});
};

LocaleManager.prototype.writeLocaleCaches = function(callback) {
    var self = this;
    async.eachLimit(Object.keys(self.locales), 10, function(localeName, cb) {
        var locale = self.locales[localeName];
        self.core.localeCacher.writeLocaleCache(locale.hash, locale.data, cb);
    }, callback);
};
