var _ = require('lodash');
var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');
var crypto = require('crypto');

var hasFields = exports.hasFields = function(object, fields) {
    return _.every(fields, function(field) {
        return _.has(object, field) && object[field] !== undefined;
    });
};

var isInteger = exports.isInteger = function(value) {
    return (typeof(value) === "number") && (value % 1 === 0);
};

var loadInstances = exports.loadInstances = function(core, constructors) {
    return _.reduce(constructors, function(result, constructor, name) {
        result[name] = new constructor(core);
        return result;
    }, {});
};

var hashObject = exports.hashObject = function(obj, type) {
    return hashString(JSON.stringify(obj), type || "sha1");
};

var hashString = exports.hashString = function(str, type) {
    return crypto.createHash(type || "sha1").update(str, "utf-8").digest("hex");
};

var loadYaml = exports.loadYaml = function(path) {
    return yaml.safeLoad(fs.readFileSync(fs.realpathSync(path), 'utf8'));
};

var requireDir = exports.requireDir = function(root, opts, handler) {
    opts = _.defaults(opts || {}, {
        recursive: true,
        nested: false,
        exclude: [],
        exts: ['.js', '.json']
    });

    if (!handler) {
        handler = function(file) { return require(file); };
    }

    var combine = function(dir) {
        return fs.readdirSync(dir).reduce(function(result, fileName) {
            if (opts.exclude.indexOf(fileName) >= 0) {
                return result;
            }
            var file = path.join(dir, fileName);
            var ext = path.extname(fileName);

            if (opts.recursive && fs.statSync(file).isDirectory()) {
                if (opts.nested) {
                    result[fileName] = combine(file);
                } else {
                    _.extend(result, combine(file));
                }
            } else if (opts.exts.indexOf(ext) >= 0 && fileName !== 'index.js' ) {
                result[path.basename(file, ext)] = handler(file);
            }
            return result;
        }, {});
    };

    return combine(path.resolve(root));
};

var requireInstances = exports.requireInstances = function(initializer, root, opts) {
    return loadInstances(initializer, requireDir(root, opts));
};

var adler32 = exports.adler32 = function(data) {
    var base = 4096;
    var chunk = 1024;

    var len = data.length;
    var sum = 1;
    var int1 = sum & 0xFFFF;
    var int2 = sum >> 16;
    var i = -1;
    while (len > 0) {
        var n = chunk > len ? len : chunk;
        len -= n;
        while (n-- >= 0) {
            int1 = int1 + data.charCodeAt(i++) & 0xFF;
            int2 = int2 + int1;
        }
        int1 %= base;
        int2 %= base;
    }
    return int1 << 16 | int2;
};

exports.formatDate = function(date, fstr, utc) {
    utc = utc ? 'getUTC' : 'get';
    return fstr.replace (/%[YmdHMS]/g, function (m) {
        switch (m) {
            case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
            case '%m': m = 1 + date[utc + 'Month'] (); break;
            case '%d': m = date[utc + 'Date'] (); break;
            case '%H': m = date[utc + 'Hours'] (); break;
            case '%M': m = date[utc + 'Minutes'] (); break;
            case '%S': m = date[utc + 'Seconds'] (); break;
            default: return m.slice (1); // unknown code, remove %
        }
        // add leading zero if required
        return ('0' + m).slice (-2);
    });
};
