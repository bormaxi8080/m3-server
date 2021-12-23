var _ = require('lodash');

var MethodAccessorGenerator = require('../methodAccessorGenerator.js');

var Levels = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.defs = state.defs;
    this.levels = {};
    this.newLevels = [];
};

MethodAccessorGenerator.injectDefAccessor(Levels.prototype, "level", "Level", "map.levels");

MethodAccessorGenerator.injectDefAccessor(Levels.prototype, "bonusLevel", "BonusLevel", "map.bonus_levels");
MethodAccessorGenerator.injectStateAccessor(Levels.prototype, "bonusLevel", "BonusLevel", "bonus_levels");

Levels.prototype.calculateReward = function(level, oldScore, newScore) {
    var self = this;
    if (newScore > oldScore) {
        return this.defs.get(this.levelProp(level) + '.scores').reduce(function(memo, cond) {
            if (oldScore < cond.score && newScore >= cond.score) {
                self.state.player.accumulateReward(memo, cond.reward);
            }
            return memo;
        }, {});
    } else {
        return {};
    }
};

Levels.prototype.getChapterForBonusLevel = function(level) {
    return this.defs.get(this.bonusLevelProp(level) + '.chapterId');
};

Levels.prototype.getChapterForLevel = function(level) {
    return this.defs.get(this.levelProp(level) + '.chapter_id');
};

Levels.prototype.isFirstLevelInChapter = function(level) {
    return (level === 1) || (this.getChapterForLevel(level) > this.getChapterForLevel(level - 1));
};

Levels.prototype.isLastLevelInChapter = function(level) {
    return this.isLastLevel(level) || (this.getChapterForLevel(level) < this.getChapterForLevel(level + 1));
};

Levels.prototype.isLastLevel = function(level) {
    return level === this.defs.get('map.level_counter');
};
