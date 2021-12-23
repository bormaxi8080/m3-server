var _ = require('lodash');
var crypto = require("crypto");

var TokenValidator = module.exports = function(core) {
    this.core = core;
    this.logger = core.logger;
    this.tokenSecret = core.config.app.token_secret;
};

TokenValidator.prototype.createSignature = function(obj) {
    return Object.keys(obj).sort().map(function(key) {
        return key + "=" + JSON.stringify(obj[key]);
    }).join('|') + this.tokenSecret;
};

TokenValidator.prototype.createToken = function(obj) {
    return crypto.createHash("sha1").update(this.createSignature(obj), "utf-8").digest("hex");
};

TokenValidator.prototype.before = function(task, next) {
    if (!task.post.token) {
        return next({error: {code: 'token_not_found'}});
    }

    var token = task.post.token;
    delete task.post.token;

    if (token === this.createToken(task.post)) {
        next();
    } else {
        next({error: {code: 'token_not_valid'}});
    }
};
