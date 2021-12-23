var fs = require('fs');
var qs = require('querystring');
var URL = require('url');
var domain = require('domain');
var clone = require('node-v8-clone').clone;
var Formidable = require('formidable');

var BodyParser = module.exports = function(core) {
    this.core = core;
    this.logger = core.logger;

    this.maxContentLength = 1024 * 1024;  // const
};

BodyParser.prototype.before = function(task, next) {
    var self = this;
    var requestInfo = URL.parse(task.request.url, true);

    task.query = requestInfo.query;
    task.path = requestInfo.pathname;

    var headers = prepareHeaders(task.request.headers);
    var fields = {};

    this.checkSize(headers["content-length"]);
    if (this.isMultipart(headers)) {
        var form = new Formidable.IncomingForm();
        form.parse(task.request, function(err, fields, files) {
            if (err) {
                task.request.end();
                task.closed = true;
                throw new Error("Formidable ERR: " + err);
            }
            self.finishParsing(task, next);
        });
    } else {
        var requestBody = "";
        var readedSize = 0;
        task.request.on("data", function(chunk) {
            self.checkSize(readedSize += chunk.length);
            requestBody += chunk.toString();
        });
        task.request.on("end", function() {
            try {
                task.post = JSON.parse(requestBody);
            } catch (err) {
                task.post = requestBody;
            }
            self.finishParsing(task, next);
        });
    }
};

BodyParser.prototype.finishParsing = function(task, next) {
    this.addDomainMetadata(task);
    this.logger.info(task.request.method + ":" + task.request.url);
    next(null);
};

BodyParser.prototype.addDomainMetadata = function(task) {
    if (domain.active) {
        domain.active.request_url = task.request.url;
        domain.active.client_ip = task.request.connection.remoteAddress;
        if (task.post) {
            domain.active.post_params = clone(task.post);
        }
    }
};

BodyParser.prototype.isMultipart = function(headers) {
    var header = headers["content-type"];
    return header && header.indexOf("multipart/form-data") >= 0;
};

BodyParser.prototype.checkSize = function(size) {
    if (size && size > this.maxContentLength) {
        throw new Error ("ERROR. Too long request. Readed: " + size + "; Limit: "+ this.maxContentLength);
    }
};

var prepareHeaders = function(headers) {
    var result = {};
    for (var fieldName in headers) {
        if (typeof headers[fieldName] === "string") {
            result[fieldName.toLowerCase()] = headers[fieldName];
        }
    }
    return result;
};
