var isPlainObject = require('lodash').isPlainObject;
var SendMessageCommand = module.exports = {};

SendMessageCommand.nonProduction = true;

SendMessageCommand.middleware = ['sendMessages'];

SendMessageCommand.validateParams = function(params) {
    return params.user_id && params.type && isPlainObject(params.params);
};

SendMessageCommand.execute = function(state, params) {
    state.messages.addOutgoing(params.user_id, params.type, params.params);
};
