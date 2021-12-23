var utils = require('../../utils');
var Journal = require('../../journal');

var BuySecretLevelCheatCommand = module.exports = {};

BuySecretLevelCheatCommand.validateParams = function(params) {
    return true;
};

BuySecretLevelCheatCommand.execute = function(state, params) {
    state.secretLevels.checkCurrentLevelActive();
    var curSecretLevel = state.secretLevels.getCurrent();
    var price = state.secretLevels.getCheatPriceByLevel(curSecretLevel);
    state.player.reduceBalance(price);
    state.addEvent('apply_secret_level_cheat', curSecretLevel);
    Journal.event('buy_secret_level_cheat', params);
};
