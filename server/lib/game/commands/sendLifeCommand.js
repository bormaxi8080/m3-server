var utils = require('../../utils');

var SendLifeCommand = module.exports = {};

SendLifeCommand.middleware = ['sendMessages'];

SendLifeCommand.validateParams = function(params) {
    return !!(params && utils.isInteger(params.user_id) && (params.user_id > 0));
};

SendLifeCommand.execute = function(state, params) {
    var messParams = {};
    if (params.fb_request_id) {
        messParams.fb_request_id = params.fb_request_id;
    }
    state.messages.addOutgoing(params.user_id, 'life', messParams);
};
