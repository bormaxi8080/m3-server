var _ = require('lodash');

var utils = require('../utils');

var AccessProtocolError = require('../accessProtocolError.js');

var DataWrapper = module.exports = function(data, opts) {
    this.readonly = opts && opts.readonly || false;
    this.raw = data;
};

DataWrapper.prototype.get = function(path) {
    if (!path) {
        throw new AccessProtocolError("Path is empty");
    }
    var results = this.search(path, false);
    if (results === null || results.exists === false) {
        throw new AccessProtocolError("Property " + path + " not found");
    } else {
        return results.value;
    }
};

DataWrapper.prototype.getOrDefault = function(path, value) {
    if (!path) {
        throw new AccessProtocolError("Path is empty");
    }
    var results = this.search(path, false);
    if (results === null || results.exists === false) {
        return value;
    } else {
        return results.value;
    }
};

DataWrapper.prototype.set = function(path, value) {
    if (this.readonly) {
        throw new AccessProtocolError("DataWrapper is readonly");
    }
    if (!path) {
        throw new AccessProtocolError("Path is empty");
    }
    var results = this.search(path, true);
    results.holder[results.key] = value;
};

DataWrapper.prototype.has = function(path) {
    if (!path) {
        throw new AccessProtocolError("Path is empty");
    }

    var results = this.search(path, true);
    return !(results === null || results.exists === false);
};

DataWrapper.prototype.inc = function(path, value) {
    if (this.readonly) {
        throw new AccessProtocolError("DataWrapper is readonly");
    }

    if (!path) {
        throw new AccessProtocolError("Path is empty");
    }

    var results = this.search(path, false);
    if (results === null || results.exists === false) {
        throw new AccessProtocolError("Property " + path + " not found");
    } else {
        results.holder[results.key] = results.value + value;
    }
};

DataWrapper.prototype.push = function(path, value) {
    if (this.readonly) {
        throw new AccessProtocolError("DataWrapper is readonly");
    }

    if (!path) {
        throw new AccessProtocolError("Path is empty");
    }

    var results = this.search(path, false);
    if (results === null || results.exists === false) {
        throw new AccessProtocolError("Property " + path + " not found");
    } else if (Array.isArray(results.value)) {
        results.value.push(value);
    } else {
        throw new AccessProtocolError("Property " + path + " is not array, push is not available");
    }
};

DataWrapper.prototype.search = function(path, create) {
    var elements = path.split('.');
    var count = elements.length - 1;
    var parent = null;
    var value = this.raw;
    var key = elements[count];
    for (var i = 0; i < count; ++i) {
        parent = value;
        value = value[elements[i]];
        if (!value) {
            if (create) {
                value = parent[elements[i]] = {};
            } else {
                return null;
            }
        }
    }

    return {
        key: key,
        holder: value,
        value: value[key],
        exists: value[key] !== undefined
    };
};
