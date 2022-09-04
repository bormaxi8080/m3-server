var _ = require('lodash');
var path = require('path');
var crypto = require('crypto');
var uuid = require('node-uuid');
var syncRequest = require('./syncRequest.js');

var Session = require('./session.js');

var ROOT_PATH = path.resolve(path.join(__dirname, '..'));

var Server = module.exports = function(config) {
    this.config = config;
    this.url = config.url;
    this.verbose = config.verbose;
};

Server.byId = function(server_id, extraConfig) {
    var config = require(path.join(ROOT_PATH, 'servers.json'))[server_id];
    if (!config) {
        throw new Error("Server " + server_id + " not found in servers.json!");
    }
    return new Server(_.extend(config, extraConfig));
};

Server.prototype.request = function(method, route, params) {
    var routeUrl = "http://" + this.url + route;
    if (global.reporter) {
        var result;
        global.reporter.measure(routeUrl, function() {
            result = syncRequest(method, routeUrl, params);
        });

        if (this.verbose) {
            console.log("%s: %s", method, routeUrl);
            console.log("BODY: %s", JSON.stringify(params, null, 2));
            console.log("");
            console.log("RESPONSE: %s", result);
            console.log("");
            console.log("");
        }
        return result;
    } else {
        return syncRequest(method, routeUrl, params);
    }
};

Server.prototype.postRequest = function(route, params) {
    return this.request("post", route, params);
};

Server.prototype.getRequest = function(route, params) {
    return this.request("get", route, params);
};

Server.prototype.login = function(options) {
    var response = JSON.parse(this.postRequest("/login", options));
    return new Session(this, response.token);
};
