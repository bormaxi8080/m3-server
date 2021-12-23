var Base = require('../../net/commandsMiddlewareBase');

var IdkfaCommandMiddleware = module.exports = Base(function(core) {
    this.core = core;
});

IdkfaCommandMiddleware.prototype.finalize = function(state, trx, cb) {
    var code = 'last_finish_level';
    if (state.idkfa) {
        this.core.sheduleManager.setImmediateKeyHash(code, state.id, state.idkfa.level, cb);
    } else {
        cb();
    }
}
