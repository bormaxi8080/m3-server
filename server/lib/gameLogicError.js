var util = require('util');

var GameLogicError = module.exports = function(message) {
    this.name = "GameLogicError";
    this.message = message;
    this.stack = new Error(message).stack;
    this.toString = function () {
        return this.name + ": " + this.message;
    };
};

util.inherits(GameLogicError, Error);
