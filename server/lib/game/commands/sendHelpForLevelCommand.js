var utils = require('../../utils');
var GameLogicError = require('../../gameLogicError.js');

var SendHelpForLevelCommand = module.exports = {};

SendHelpForLevelCommand.middleware = ['sendMessages'];

SendHelpForLevelCommand.validateParams = function(params) {
    return utils.isInteger(params.user_id) && (params.user_id > 0) &&
        utils.isInteger(params.level) && (params.level > 0);
};

SendHelpForLevelCommand.execute = function(state, params) {
    var messParams = {};
    if (params.fb_request_id) {
        messParams.fb_request_id = params.fb_request_id;
    }
    messParams.type = 'gingerbread_man';
    messParams.params = {level: params.level};
    state.messages.addOutgoing(params.user_id, 'booster', messParams);
};
