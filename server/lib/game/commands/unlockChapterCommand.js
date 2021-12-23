var Journal = require('../../journal');
var GameLogicError = require('../../gameLogicError.js');

var UnlockChapterCommand = module.exports = {};

UnlockChapterCommand.validateParams = function(params) {
    return true;  // no parameters
};

UnlockChapterCommand.execute = function(state, params) {
    var chapter = state.chapter.getLockedChapter();
    if (!chapter) {
        throw new GameLogicError('There are no locked chapters in current state');
    }
    state.chapter.unlockChapter(chapter.id);
    state.secretLevels.unlockNextSecretLevel();
    Journal.event('unlock_chapter', params);
};
