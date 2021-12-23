var _ = require('lodash');

var Journal = require('../../journal');
var Utils = require('../../utils');

var FinishBonusLevelCommand = module.exports = {};

FinishBonusLevelCommand.middleware = ['levels'];

FinishBonusLevelCommand.validateParams = function(params) {
    return Utils.hasFields(params, ['level', 'score', 'rewards']) &&
        (Utils.isInteger(params.score)) &&
        (params.score >= 0) &&
        (Array.isArray(params.rewards));
};

FinishBonusLevelCommand.execute = function(state, params) {
    var level = params.level;
    var score = params.score;
    var rewards = params.rewards;

    state.levels.checkBonusLevelDefined(level);

    var chapterId = state.levels.bonusLevel(level).chapter_id;
    state.chapter.checkChapterExists(chapterId);
    state.chapter.checkChapterUnlocked(chapterId);

    if (state.levels.levels[level]) {
        state.levels.levels[level] = Math.max(state.levels.levels[level], score);
    } else {
        state.levels.levels[level] = score;
        state.levels.newLevels.push(level);
    }

    var stateRewards = [];
    if (state.levels.isBonusLevelExists(level)) {
        stateRewards = state.levels.bonusLevelState(level);
    }
    var diff = _.difference(rewards, stateRewards);

    state.player.applyReward(state.player.reduceReward(_.map(diff, function(rewardIndex) {
        return state.levels.bonusLevel(level).rewards[rewardIndex];
    })));

    state.data.set(state.levels.bonusLevelStateProp(level), _.union(stateRewards, rewards));

    Journal.event('finish_bonus_level', params);
};
