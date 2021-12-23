var _ = require('lodash');

var Task = module.exports = function(request, response, core) {
    this.request = request;
    this.response = response;
    this.core = core;
    this.data = null;
    this.closed = false;
};

Task.prototype.reply = function(code, headers, body) {
    if (!this.closed) {
        if (!(body instanceof Buffer) && typeof(body) === 'object') {
            body = JSON.stringify(body, null, 2);
            headers['Content-Type'] = 'application/json; charset=utf-8';
        }
        this.response.writeHead(code, headers);
        this.response.end(body);
        this.closed = true;
    }
};

Task.prototype.replyJSON = function(code, body) {
    this.reply(code, {'Content-Type': 'application/json; charset=utf-8'}, body);
};

Task.prototype.replyHTML = function(code, headers, body) {
    this.reply(code, _.extend({'Content-Type': 'text/html; charset=utf-8'}, headers), body);
};

Task.prototype.error = function(err, errReply, httpCode) {
    this.core.logger.warn(err, this.request.url);
    this.reply(httpCode || 200, {}, errReply || err);
};

Task.prototype.controllerError = function(controllerName, httpCode, err, errorCode) {
    this.reply(httpCode, {}, errorCode ? {error: errorCode} : (err.error ? err : {error: err}));
    if (err.stack) {
        this.core.logger.warn(controllerName + " error: " + err);
        this.core.logger.warn(err.stack);
    } else {
        this.core.logger.warn(controllerName + " error: " + JSON.stringify(err));
    }
};
