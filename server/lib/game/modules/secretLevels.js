var GameLogicError = require('../../gameLogicError.js');

var MethodAccessorGenerator = require('../methodAccessorGenerator.js');

var SecretLevels = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.defs = state.defs;
};

MethodAccessorGenerator.injectDefAccessor(SecretLevels.prototype, "level", "secret levels", "secret_levels");

SecretLevels.prototype.getCurrent = function() {
    return this.state.data.get('secret_levels.current');
};

SecretLevels.prototype.getLastFinished = function() {
    return this.state.data.getOrDefault('secret_levels.last_finished', false);
};

SecretLevels.prototype.checkCurrentLevelActive = function() {
    if (this.getCurrent() === this.getLastFinished()) {
        throw new GameLogicError("level is already finished");
    }
};

SecretLevels.prototype.finishCurrentLevel = function() {
    this.checkCurrentLevelActive();
    var current = this.getCurrent();

    this.updateProgress(undefined);
    this.state.data.set('secret_levels.last_finished', current);
};

SecretLevels.prototype.getConditionByLevel = function(id) {
    return this.level(id).condition;
};

SecretLevels.prototype.getChapterByLevel = function(id) {
    return this.level(id).chapter_id;
};

SecretLevels.prototype.getCheatPriceByLevel = function(id) {
    return this.level(id).cheat_price;
};

SecretLevels.prototype.updateProgress = function(progress) {
    this.state.data.set('secret_levels.progress', progress);
};

SecretLevels.prototype.unlockNextSecretLevel = function() {
    var lastFinished = this.getLastFinished();
    if (lastFinished) {
        var nextLevel = lastFinished + 1;
        var defKey = ['secret_levels', nextLevel, 'chapter_id'].join('.');
        var needChapter = this.state.defs.getOrDefault(defKey, false);
        if (needChapter) {
            var curChapter = this.state.chapter.getCurrentChapterId();
            if (curChapter >= needChapter) {
                this.state.data.set('secret_levels.current', nextLevel);
            }
        }
    }
};
