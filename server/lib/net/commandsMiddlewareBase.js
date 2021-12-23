var util = require('util');

var CommandsMiddlewareBase = module.exports = function(fn) {
    util.inherits(fn, CommandsMiddlewareBase);
    return fn;
};

CommandsMiddlewareBase.prototype.getFinalizeTasks = function(state, trx) {
    if (this.finalize) {
        var self = this;
        return [ function(cb) { self.finalize(state, trx, cb); } ];
    }
};
