var _ = require('lodash');
var path = require('path');
var crypto = require('crypto');
var uuid = require('node-uuid');
var syncRequest = require('./syncRequest.js');

var SessionHandler = require('./sessionHandler.js');

var User = require('./user');

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

Server.prototype.generateUser = function(options) {
    var user =  new User(this, options);
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

Server.prototype.networkAuth = function(networkCode, networkId) {
    var key = networkCode + '_' + networkId + '_' + this.config.networks[networkCode].secret;
    return crypto.createHash("sha1").update(key, "utf-8").digest("hex");
};

Server.prototype.request = function(method, route, params) {
    var routeUrl = "http://" + this.url + route;

    params.token = this.tokenAuth(params);
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

Server.prototype.getSession = function(options) {
    var res = this.postRequest("/session/get", options);
    return JSON.parse(res);
};

Server.prototype.generateSessionHandler = function(session) {
    return new SessionHandler(session);
};

Server.prototype.updateSession = function(options) {
    var res = this.postRequest("/session/update", options);
    return JSON.parse(res);
};

Server.prototype.setupClientNetwork = function(networkCode, networkId) {
    this.client_network = this.generateNetwork(networkCode, networkId);
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

Server.prototype.init = function(options) {
    var res = this.postRequest("/init", options);
    return JSON.parse(res);
};

Server.prototype.reset = function(options) {
    var res = this.postRequest("/reset", options);
    return JSON.parse(res);
};

Server.prototype.levelsQuery = function(options) {
    var res = this.postRequest("/query/levels", options);
    return JSON.parse(res);
};

Server.prototype.usersQuery = function(options) {
    var res = this.postRequest("/query/users", options);
    return JSON.parse(res);
};

Server.prototype.usersProgressQuery = function(options) {
    var res = this.postRequest("/query/users/progress", options);
    return JSON.parse(res);
};

Server.prototype.usersTimeQuery = function(options) {
    var res = this.postRequest("/query/users/time", options);
    return JSON.parse(res);
};

Server.prototype.usersLevelsQuery = function(options) {
    var res = this.postRequest("/query/users/levels", options);
    return JSON.parse(res);
};

Server.prototype.commands = function(options) {
    var i = 0;
    _.each(options.commands, function(command) {
        if (!command.id) command.id = ++i;
    });

    var res = this.postRequest("/commands", options);
    return JSON.parse(res);
};
