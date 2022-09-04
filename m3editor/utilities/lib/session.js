var _ = require('lodash');

var Session = module.exports = function(server, token) {
    this.server = server;
    this.token = token;
};

Session.prototype.request = function(method, url, data) {
    return this.server.request(method, url, _.extend(data, {query: {token: this.token}}));
};

Session.prototype.insertLevel = function(level) {
    return JSON.parse(this.request("post", "/levels", level));
};
