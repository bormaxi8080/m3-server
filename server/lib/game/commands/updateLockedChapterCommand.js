// Note: this is a non-production command!

var GameLogicError = require('../../gameLogicError.js');

var UpdateLockedChapterCommand = module.exports = {};

UpdateLockedChapterCommand.nonProduction = true;

UpdateLockedChapterCommand.validateParams = function(params) {
    return true;
};

UpdateLockedChapterCommand.execute = function(state, params) {
    var chapter = state.chapter.getLockedChapter();
    if (!chapter) {
        throw new GameLogicError('There are no locked chapters in current state');
    }

    if (params.unlock_on) {
        state.chapter.setUnlockTime(chapter.id, params.unlock_on);
    }
    if (params.unlocked) {
        state.chapter.unlockChapter(chapter.id);
    }
};
