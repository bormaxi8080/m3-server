var crypto = require('crypto');
var _ = require('lodash');

var User = module.exports = function(server, options) {
    this.server = server;
    options = options || {};
    this.commandCounter = 0;
    this.clientNetwork = options.client_network || this.server.generateDeviceNetwork();
};

User.prototype.request = function(url, options) {
    if (!this.sessionId) {
        var sessionData = this.server.getSession({ client_network: this.clientNetwork });
        this.sessionId = sessionData.session;
    }
    options.session = this.sessionId;
    return this.server.postRequest(url, options);
};

User.prototype.init = function() {
    var self = this;
    this.initData = this.request("/init", {});
    if (this.initData.user_data) {
        this.id = this.initData.user_data.user_id;
    } else if (this.initData.error) {
        throw new Error(this.initData.error);
    }
    return this.initData;
};

User.prototype.commands = function(commands) {
    _.each(commands, function(command) {
        if (!command.id) {
            command.id = ++this.commandCounter;
        }
    }, this);
    return this.request("/commands", {commands: commands});
};

User.prototype.defs = function(reload) {
    if (reload || !this.defsCache) {
        this.defsCache = this.request('/defs?hash=' + this.initData.defs_hash, {});
    }
    return this.defsCache;
};
