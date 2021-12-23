var utils = require('../../utils');

var ReadMessageCommand = module.exports = {};

ReadMessageCommand.middleware = ['readMessages', 'sendMessages'];

ReadMessageCommand.validateParams = function(params) {
    return !!(params && utils.isInteger(params.message_id) && (params.message_id > 0));
};

ReadMessageCommand.execute = function(state, params) {
    state.messages.read(params.message_id);
};
