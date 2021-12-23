var Base = require('../../net/commandsMiddlewareBase');


var SendMessagesCommandMiddleware = module.exports = Base(function(core) {
    this.core = core;
});


SendMessagesCommandMiddleware.prototype.getFinalizeTasks = function(state, trx) {
    var messageManager = this.core.messageManager;
    if (state.messages.outgoingMessages.length) {
        return [ function(cb) { messageManager.sendMessages(state.messages.outgoingMessages, trx, cb); } ];
    }
};
