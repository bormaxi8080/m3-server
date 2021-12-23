var _ = require('lodash');

var GameLogicError = require('../../gameLogicError.js');

var MethodAccessorGenerator = require('../methodAccessorGenerator.js');

var Chapter = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.defs = state.defs;
};

MethodAccessorGenerator.injectDefAccessor(Chapter.prototype, "chapter", "Chapter", "chapters");
MethodAccessorGenerator.injectStateAccessor(Chapter.prototype, "chapter", "Chapter", "chapters");

Chapter.prototype.setChapter = function(chapterId, value) {
    this.data.set(this.chapterStateProp(chapterId), value);
};

Chapter.prototype.checkChapterUnlocked = function(chapterId) {
    if (this.locked(chapterId)) {
        throw new GameLogicError('Chapter is locked: ' + chapterId);
    }
};

Chapter.prototype.checkChapterLocked = function(id) {
    if (this.unlocked(chapterId)) {
        throw new GameLogicError('Chapter is unlocked: ' + chapterId);
    }
};

Chapter.prototype.addChapter = function(chapterId) {
    this.checkChapterNotExists(chapterId);
    this.setChapter(chapterId, {
        id: chapterId,
        unlocks: [],
        requests: {},
        unlock_on: Date.now() + this.chapter(chapterId).unlock_interval * 1000,
        unlocked: false
    });
};

Chapter.prototype.unlocked = function(chapterId) {
    return this.chapterState(chapterId).unlocked;
};

Chapter.prototype.locked = function(chapterId) {
    return !this.unlocked(chapterId);
};

Chapter.prototype.unlocksCount = function(chapterId) {
    return this.chapterState(chapterId).unlocks.length;
};

Chapter.prototype.checkCanUnlockChapter = function(chapterId) {
    if (!this.canUnlockChapter(chapterId)) {
        throw new GameLogicError('Cannot unlock chapter: ' + chapterId);
    }
};

Chapter.prototype.checkCanAddUnlock = function(chapterId, userId) {
    if (!this.canAddUnlock(chapterId, userId)) {
        throw new GameLogicError('Cannot add onlock to chapter: ' + chapterId);
    }
};

Chapter.prototype.checkCanAddUnlocks = function(chapterId, unlocksCount) {
    if (!this.canAddUnlocks(chapterId, unlocksCount)) {
        throw new GameLogicError('Cannot add unlocks to chapter: ' + chapterId);
    }
};

Chapter.prototype.canUnlockChapter = function(chapterId) {
    return this.locked(chapterId) &&
        (   (this.chapter(chapterId).unlocks_count === 0) ||
            (this.unlocksCount(chapterId) >= this.chapter(chapterId).unlocks_count) ||
            (Date.now() > this.chapterState(chapterId).unlock_on)
        );
};

Chapter.prototype.canAddUnlock = function(chapterId, userId) {
    return this.canAddUnlocks(chapterId, 1) &&
        (userId === 'relatives' || this.getUnlocks(chapterId).indexOf(userId) < 0);
};

Chapter.prototype.canAddUnlocks = function(chapterId, unlocksCount) {
    return this.locked(chapterId) &&
        this.chapter(chapterId).unlocks_count >= this.unlocksCount(chapterId) + unlocksCount;
};

Chapter.prototype.addUnlocks = function(chapterId, unlocks) {
    var len = unlocks.length;
    for (var i = 0; i < len; i++) {
        this.addUnlock(chapterId, unlocks[i]);
    }
};

Chapter.prototype.addUnlock = function(chapterId, userId) {
    if (this.canAddUnlock(chapterId, userId)) {
        this.setUnlock(chapterId, userId);
    }
};

Chapter.prototype.needUnlocksCount = function(chapterId) {
    var unlocksCount = this.unlocksCount(chapterId);
    var needCount = this.chapter(chapterId).unlocks_count;
    if (unlocksCount >= needCount) return 0;
    return needCount - unlocksCount;
};

Chapter.prototype.setUnlock = function(chapterId, userId) {
    this.getUnlocks(chapterId).push(userId);
};

Chapter.prototype.setUnlockTime = function(chapterId, timestamp) {
    this.data.set(this.chapterStateProp(chapterId) + '.unlock_on', timestamp);
};

Chapter.prototype.getUnlocks = function(chapterId) {
    return this.chapterState(chapterId).unlocks;
};

Chapter.prototype.hasUnlock = function(chapterId, userId) {
    var unlocks = this.getUnlocks(chapterId);
    return unlocks.indexOf(userId) >= 0;
};

Chapter.prototype.getRequests = function(chapterId) {
    return this.chapterState(chapterId).requests;
};

Chapter.prototype.hasRequest = function(chapterId, userId) {
    return this.data.has(this.chapterStateProp(chapterId) + '.requests.' + userId);
};

Chapter.prototype.getRequest = function(chapterId, userId) {
    return this.data.get(this.chapterStateProp(chapterId) + '.requests.' + userId);
};

Chapter.prototype.addRequest = function(chapterId, userId) {
    if (this.hasRequest(chapterId, userId)) return;
    this.data.set(this.chapterStateProp(chapterId) + '.requests.' + userId, {timestamp: Date.now()});
};

Chapter.prototype.unlockChapter = function(chapterId) {
    this.checkCanUnlockChapter(chapterId);
    this.setChapterState(chapterId, {id: chapterId, unlocked: true});
};

Chapter.prototype.getLockedChapter = function() {
    return _.find(this.data.get('chapters'), function(chapter) {
        return !chapter.unlocked;
    });
};

Chapter.prototype.hasLockedChapter = function() {
    return !!this.getLockedChapter();
};

Chapter.prototype.getCurrentChapterId = function() {
    var chapters = this.data.get('chapters');
    return _.chain(chapters).filter('unlocked').pluck('id').max().value();
};
