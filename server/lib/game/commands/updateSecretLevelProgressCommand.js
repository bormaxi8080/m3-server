var _ = require('lodash');
var utils = require('../../utils');

var Journal = require('./../../journal');

var GameLogicError = require('../../gameLogicError.js');


var UpdateSecretLevelProgressCommand = module.exports = {};

UpdateSecretLevelProgressCommand.validateParams = function(params) {
    return _.isPlainObject(params.progress) && (_.size(params.progress) > 0);
};

UpdateSecretLevelProgressCommand.execute = function(state, params) {
    state.secretLevels.checkCurrentLevelActive();

    var curSecretLevel = state.secretLevels.getCurrent();

    var condition = state.secretLevels.getConditionByLevel(curSecretLevel);

    if (_.size(params.progress) > condition.levels) {
        throw new GameLogicError("Too many items");
    }

    if (!_.all(params.progress, utils.isInteger)) {
        throw new GameLogicError("values must be integers");
    }

    var chapterId = state.secretLevels.getChapterByLevel(curSecretLevel);
    if (!_.all(Object.keys(params.progress), function(lid) {
        return chapterId === state.levels.getChapterForLevel(lid);
    })) {
        throw new GameLogicError("unexpected level(s)");
    }

    state.secretLevels.updateProgress(params.progress);

    Journal.event('update_secret_level_progress', params);
};
