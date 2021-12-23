var Journal = require('../../journal');
var Utils = require('../../utils');

var FinishLevelCommand = module.exports = {};

FinishLevelCommand.middleware = ['levels'];

FinishLevelCommand.validateParams = function(params) {
    return Utils.hasFields(params, ['level', 'score']) &&
        (Utils.isInteger(params.level)) &&
        (Utils.isInteger(params.score)) &&
        (params.level >= 1) &&
        (params.score >= 0);
};

FinishLevelCommand.execute = function(state, params) {
    var level = params.level;
    var score = params.score;

    if (params.used_boosters) {
        state.player.checkBoosters(params.used_boosters);
    }

    var oldScore = state.levels.levels[level] || 0;
    state.player.applyReward(state.levels.calculateReward(level, oldScore, score));

    if (state.levels.levels[level]) {
        state.levels.levels[level] = Math.max(state.levels.levels[level], score);
    } else {
        state.levels.levels[level] = score;

        state.chapter.checkChapterUnlocked(state.levels.getChapterForLevel(level));

        if (!state.levels.isLastLevel(level)) {
            if (state.levels.isLastLevelInChapter(level)) {
                var chapterId = state.levels.getChapterForLevel(level + 1);
                state.chapter.addChapter(chapterId);
            }
            state.player.setProgress(Math.max(level + 1, state.player.getProgress()));
        } else {
            state.player.setProgress(Math.max(level, state.player.getProgress()));
        }

        state.cafe.unlockItemsByLevel(level);
        state.levels.newLevels.push(level);
    }

    Journal.event('finish_level', params);
};
