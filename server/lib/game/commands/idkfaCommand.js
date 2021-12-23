// Note: this a is non-production command!

var GameLogicError = require('../../gameLogicError.js');
var Utils = require('../../utils');

var IdkfaCommand = module.exports = {};

IdkfaCommand.nonProduction = true;

IdkfaCommand.middleware = ['idkfa'];

IdkfaCommand.validateParams = function(params) {
    return true;
};

IdkfaCommand.execute = function(state, params) {
    if (params.real_balance) {
        if (!Utils.isInteger(params.real_balance)) {
            throw new GameLogicError('Incorrect real_balance parameter');
        }
        state.player.addRealBalance(params.real_balance);
    }
    if (params.game_balance) {
        if (!Utils.isInteger(params.game_balance)) {
            throw new GameLogicError('Incorrect game_balance parameter');
        }
        state.player.addGameBalance(params.game_balance);
    }
    if (params.help_for_level) {
        if (!Utils.isInteger(params.help_for_level)) {
            throw new GameLogicError('Incorrect help_for_level parameter');
        }
        state.idkfa = {level: params.help_for_level};
    }
};
