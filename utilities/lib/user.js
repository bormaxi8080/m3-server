var crypto = require('crypto');
var uuid = require('node-uuid');
var _ = require('lodash');

var User = module.exports = function(server, options) {
    this.server = server;
    options || (options = {});
    if (options.client_network) {
        this.clientNetwork = options.client_network
    } else {
        if (options.is_fb_user) {
            this.clientNetwork = this.generateFacebookNetwork();
        } else {
            this.clientNetwork = this.generateDeviceNetwork();
        }
    }
};

User.prototype.generateNetwork = function(networkCode, networkId) {
    return this.server.generateNetwork(networkCode, networkId);
};

User.prototype.generateDeviceNetwork = function() {
    return this.generateNetwork('device', uuid.v4());
};

User.prototype.generateFacebookNetwork = function() {
    return this.generateNetwork('FB', ~~(Math.random() * 100000000));
};

User.prototype.request = function(url, options, callback) {
    if (!this.sessionId) {
        var sessionData = this.server.getSession({ client_network: this.clientNetwork });
        this.sessionId = sessionData.session;
    }
    options.session = this.sessionId;
    var postData = this.server.postRequest(url, options);
    return JSON.parse(postData);
};

User.prototype.init = function() {
    var self = this;
    var initData = this.request("/init", {});
    this.id = initData.user_data.user_id;
    return initData;
};

User.prototype.commands = function(commands, callback) {
    var i = 0;
    _.each(commands, function(command) {
        if (!command.id) command.id = ++i;
    });
    return this.request("/commands", {commands: commands});
};
