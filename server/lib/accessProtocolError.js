var util = require('util');

var AccessProtocolError = module.exports = function(message) {
    this.name = "AccessProtocolError";
    this.message = message;
    this.stack = new Error(message).stack;
    this.toString = function () {
        return this.name + ": " + this.message;
    };
};

util.inherits(AccessProtocolError, Error);
