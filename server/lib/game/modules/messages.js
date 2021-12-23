var _ = require('lodash');

var Journal = require('./../../journal');

var GameLogicError = require('../../gameLogicError');

var MessageManager = require('../../messageManager');

var Messages = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.config = state.config;
    this.outgoingMessages = [];
    this.readedMessages = [];
};

Messages.prototype.readSubCommands = require('./readMessage');
Messages.prototype.sendSubCommands = require('./sendMessage');

Messages.prototype.addOutgoing = function(user_id, type, params, silent) {
    var messageTypeDef = this.state.defs.get('messages.types.' + type);
    var stateKey = 'messages.last_send_to.' + type + '.' + user_id;
    var dateNow = Date.now();
    if (messageTypeDef.period) {
        if ( (dateNow - this.state.data.getOrDefault(stateKey, 0)) < (messageTypeDef.period * 1000) ) {
            if (silent) {
                return;
            } else {
                throw new GameLogicError('Need to wait more time before send the message');
            }
        }
    }
    this.state.data.set(stateKey, dateNow);
    if (this.sendSubCommands[type]) {
        this.sendSubCommands[type].call(this, user_id, params);
    }
    var mess = MessageManager.makeMessage(user_id, parseInt(this.state.id), type, params);
    this.outgoingMessages.push(mess);
    Journal.event('send_message', mess);
};

Messages.prototype.read = function(messageId) {
    var message = this.indexedMessages[messageId];
    if (message && this.readSubCommands[message.type]) {
        this.readSubCommands[message.type].call(this, message);
    }

    this.readedMessages.push(messageId);
};
