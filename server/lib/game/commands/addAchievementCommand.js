var Utils = require('../../utils');
var Journal = require('../../journal');

var GameLogicError = require('../../gameLogicError.js');

var AddAchievementCommand = module.exports = {};

AddAchievementCommand.validateParams = function(params) {
    return Utils.hasFields(params, ['achievement', 'level']);
};

AddAchievementCommand.execute = function(state, params) {
    var achievement = params.achievement;
    var level = params.level;

    state.achievement.checkAchievementDefined(achievement);
    state.achievement.checkAchievementLevelDefined(achievement, level);

    state.achievement.addAchievement(achievement, level);
    Journal.event('add_achievement', params);
};
