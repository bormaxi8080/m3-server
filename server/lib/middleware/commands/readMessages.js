var _ = require('lodash');
var Base = require('../../net/commandsMiddlewareBase');

var ReadMessagesCommandMiddleware = module.exports = Base(function(core) {
    this.core = core;
});

ReadMessagesCommandMiddleware.prototype.beforePrepareState = function(userId, commands, trx, callback) {
    this.core.messageManager.getUnreadMessages(userId, trx, callback);
};

ReadMessagesCommandMiddleware.prototype.prepareState = function(state, result) {
    state.messages.messages = result;
    state.messages.indexedMessages = _.indexBy(result, 'id');
};

ReadMessagesCommandMiddleware.prototype.getFinalizeTasks = function(state, trx) {
    var self = this;

    if (state.messages.readedMessages.length) {
        return [ function(cb) { self.readMessages(state.id, state.messages.readedMessages, trx, cb); } ];
    }
};

ReadMessagesCommandMiddleware.prototype.readMessages = function(userId, messagesIds, trx, callback) {
    this.core.messageManager.readMessages(userId, messagesIds, trx, callback);
};
