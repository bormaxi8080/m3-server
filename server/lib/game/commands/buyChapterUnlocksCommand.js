var Journal = require('../../journal');

var GameLogicError = require('../../gameLogicError.js');

var BuyChapterUnlocksCommand = module.exports = {};

BuyChapterUnlocksCommand.validateParams = function(params) {
    return true;  // no parameters
};

BuyChapterUnlocksCommand.execute = function(state, params) {
    var chapter = state.chapter.getLockedChapter();
    if (!chapter) {
        throw new GameLogicError('There are no locked chapters in current state');
    }
    var unlocksCount = state.chapter.needUnlocksCount(chapter.id);
    if (unlocksCount === 0) {
        throw new GameLogicError('Unlocks is not required for this chapter');
    }

    var unlocks = [];
    for (var i = 0; i < unlocksCount; i++) {
        unlocks.push('relatives');
    }
    state.chapter.addUnlocks(chapter.id, unlocks);

    var price = state.unlocks.unlock(unlocksCount).price;
    var effect = state.cache.actionsCache.getUnlocksEffect(unlocksCount, Date.now());
    if (effect.price) {
        price = effect.price;
    }
    state.player.reduceBalance(price);

    Journal.event('buy_chapter_unlocks', {unlocks_count: unlocksCount});
};
