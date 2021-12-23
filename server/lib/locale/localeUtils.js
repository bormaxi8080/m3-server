var _ = require('lodash');
var LocaleUtils = module.exports = {};

var joinPath = LocaleUtils.joinPath = function(path, key) {
    return (path ? (path + "." + key) : key);
};

var iterateKeys = LocaleUtils.iterateKeys = function(obj, path, fn) {
    if (_.isPlainObject(obj) || _.isArray(obj)) {
        _.each(obj, function(val, key) {
            iterateKeys(val, joinPath(path, key), fn);
        });
    } else {
        if (_.isString(obj)) {
            // '*' references to 'path.key'
            // '*alpha' refereces to 'path.key_alpha'
            // '$custom_path' references to '$custom_path'
            if (obj[0] === '*') {
                var key = path;
                if (obj.length > 1) {
                    key += '_' + obj.substring(1);
                }
                fn(path, key);
            } else if (obj[0] === '$') {
                fn(path, obj);
            }
        }
    }
};

var collectKeys = LocaleUtils.collectKeys = function(obj, path) {
    var localizationKeys = [];

    iterateKeys(obj, path, function(path, key) {
        localizationKeys.push(key);
    });

    return localizationKeys;
};
