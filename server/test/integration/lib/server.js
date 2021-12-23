var _ = require('lodash');
var path = require('path');
var crypto = require('crypto');
var uuid = require('node-uuid');

var syncRequest = require('./syncRequest.js');

var User = require('./user');

var ROOT_PATH = path.resolve(path.join(__dirname, '..'));

var Server = module.exports = function(config) {
    this.config = config;
    this.url = config.url;
    this.verbose = config.verbose;
};

Server.byId = function(server_id, extraConfig) {
    var config = require(path.join(ROOT_PATH, 'config/servers.json'))[server_id];
    if (!config) {
        throw new Error("Server " + server_id + " not found in servers.json!");
    }
    return new Server(_.extend(config, extraConfig));
};

Server.prototype.networkAuth = function(networkCode, networkId) {
    var key = networkCode + '_' + networkId + '_' + this.config.networks[networkCode].secret;
    return crypto.createHash("sha1").update(key, "utf-8").digest("hex");
};

Server.prototype.generateNetwork = function(networkCode, networkId) {
    return {
        network_code: networkCode,
        network_id: networkId,
        access_token: this.networkAuth(networkCode, networkId)
    };
};

Server.prototype.generateDeviceNetwork = function() {
    return this.generateNetwork('device', uuid.v4());
};

Server.prototype.generateFacebookNetwork = function() {
    return this.generateNetwork('FB', ~~(Math.random() * 100000000));
};

Server.prototype.generateUser = function(options) {
    var user = new User(this, options);
    if (options && options.init) {
        user.init();
    }
    return user;
};

Server.prototype.tokenAuth = function(params) {
    var str = Object.keys(params).sort().map(function(key) {
        return key + "=" + JSON.stringify(params[key]);
    }).join('|') + this.config.token_secret;
    return crypto.createHash('sha1').update(str, "utf-8").digest("hex");
};

Server.prototype.request = function(method, route, body) {
    var routeUrl = "http://" + this.url + route;

    var headers = {};
    if (typeof body === 'object') {
        body.token = this.tokenAuth(body);
        body = JSON.stringify(body);
        headers['content-type'] = 'application/json';
    }

    return syncRequest(method, routeUrl, body);
};

Server.prototype.postRequest = function(route, params) {
    return this.request("post", route, params);
};

Server.prototype.getRequest = function(route, params) {
    return this.request("get", route, params);
};

Server.prototype.getSession = function(options) {
    return this.postRequest("/session/get", options);
};
