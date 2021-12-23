var _ = require('lodash');
var utils = require('../../utils');

var Journal = require('./../../journal');

var GameLogicError = require('../../gameLogicError.js');

var FinishSecretLevelCommand = module.exports = {};

FinishSecretLevelCommand.validateParams = function(params) {
    return Array.isArray(params.rewads_ids) && params.rewads_ids.length === 3;
};

FinishSecretLevelCommand.execute = function(state, params) {
    var curLevel = state.secretLevels.getCurrent();
    var rewards = state.secretLevels.level(curLevel).rewards
    var curReward;
    for (var i = 0; i <= 2; i++) {
        curReward = rewards[params.rewads_ids[i]];
        if (curReward) {
            state.player.addBalance(curReward);
            if (curReward.boosters) {
                state.addEvent('add_boosters', curReward.boosters);
            }
        } else {
            throw new GameLogicError("Empty reward");
        }
    }
    state.secretLevels.finishCurrentLevel();
    state.secretLevels.unlockNextSecretLevel();
    Journal.event('finish_secret_level', params);
};
