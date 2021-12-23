var Utils = require('../../utils');
var Journal = require('../../journal');

var GameLogicError = require('../../gameLogicError.js');

var ClaimNextAchievementRewardCommand = module.exports = {};

ClaimNextAchievementRewardCommand.validateParams = function(params) {
    return Utils.hasFields(params, ['achievement']);
};

ClaimNextAchievementRewardCommand.execute = function(state, params) {
    var achievement = params.achievement;
    state.achievement.checkAchievementDefined(achievement);
    state.achievement.claimNextAchievementReward(achievement);
    Journal.event('claim_next_achievement_reward', params);
};
