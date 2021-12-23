var async = require('async');

var Utils = require('../../utils');

var authorizers = {
    device: require('./authorizers/fake'),
    GC: require('./authorizers/fake'),
    FB: require('./authorizers/facebook'),
    MM: require('./authorizers/mm'),
    OK: require('./authorizers/ok')
};

var Authorizer = module.exports = function(core) {
    this.core = core;
    this.logger = core.logger;
    this.config = core.config;
};

Authorizer.prototype.before = function(task, next) {
    var self = this;

    var networks = [];
    var clientCode;
    var authCode;

    if (task.post.client_network) {
        networks.push(task.post.client_network);
        clientCode = task.post.client_network.network_code;
    } else if (task.session) {
        clientCode = task.session.client_code;
    } else {
        return next({error: {code: 'auth_error', message: 'client_network_missing'}});
    }

    if (task.post.auth_network) {
        networks.push(task.post.auth_network);
        authCode = task.post.auth_network.network_code;
    }

    if (!this.core.networkManager.isValidNetworkPair(clientCode, authCode)) {
        return next({error: {code: 'auth_error', message: 'incorrect_network_relation'}});
    }

    async.each(networks, function(network, cb) {
        self.authorizeNetwork(network, cb);
    }, next);
};

Authorizer.prototype.authorizeNetwork = function(network, callback) {
    if (!Utils.hasFields(network, ['network_code', 'network_id', 'access_token'])) {
        return callback({error: {code: 'auth_error', message: 'incorrect_network_format'}});
    }
    var code = network.network_code;
    var authorizer = authorizers[code];
    if (authorizer) {
        authorizer(code, network.network_id, network.access_token, this.config.app.networks[code], callback);
    } else {
        callback({error: {code: 'auth_error', message: 'unknown_network_code'}});
    }
};
