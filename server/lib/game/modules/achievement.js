var _ = require('lodash');

var GameLogicError = require('../../gameLogicError.js');
var MethodAccessorGenerator = require('../methodAccessorGenerator.js');

var Achievement = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.defs = state.defs;
};

MethodAccessorGenerator.injectDefAccessor(Achievement.prototype, "achievement", "Achievement", "achievements");
MethodAccessorGenerator.injectStateAccessor(Achievement.prototype, "achievement", "Achievement", "achievements");

Achievement.prototype.orderProp = function() {
    return 'achievements_settings.order';
};

Achievement.prototype.order = function() {
    return this.defs.get(this.orderProp());
};

Achievement.prototype.getLevelOrder = function(level) {
    return this.order().indexOf(level);
};

Achievement.prototype.isAchievementLevelDefined = function(achievementId, level) {
    return this.defs.has(this.achievementProp(achievementId) + ".grades." + level);
};

Achievement.prototype.checkAchievementLevelDefined = function(achievementId, level) {
    if (!this.isAchievementLevelDefined(achievementId, level)) {
        throw new GameLogicError("Level " + level + " is not defined for achievement " + achievementId);
    }
};

Achievement.prototype.achievementLevelStateProp = function(achievementId) {
    return this.achievementStateProp(achievementId) + ".level";
};

Achievement.prototype.achievementLevelState = function(achievementId) {
    return this.data.getOrDefault(this.achievementLevelStateProp(achievementId), null);
};

Achievement.prototype.claimNextAchievementReward = function(achievementId) {
    this.checkAchievementExists(achievementId);

    var order = this.order();
    var achievement = this.achievementState(achievementId);
    var currentLevelIndex = order.indexOf(achievement.level);
    var rewardLevelIndex = order.indexOf(achievement.last_reward);

    if (rewardLevelIndex < currentLevelIndex) {
        var achievementGradesDef = this.achievement(achievementId).grades;

        for (var i = rewardLevelIndex + 1; i <= currentLevelIndex; ++i) {
            var nextRewardLevel = order[i];
            if (achievementGradesDef[nextRewardLevel]) {
                this.state.player.applyReward(achievementGradesDef[nextRewardLevel].reward);
                this.data.set(this.achievementProp(achievementId) + ".last_reward", nextRewardLevel);
                return;
            }
        }
    } else {
        throw new GameLogicError('Achievement reward already recieved for level ' + achievement.last_reward);
    }
};

Achievement.prototype.addAchievement = function(achievementId, level) {
    if (this.isAchievementExists(achievementId)) {
        if (this.getLevelOrder(level) > this.getLevelOrder(this.achievementLevelState(achievementId))) {
            this.data.set(this.achievementLevelStateProp(achievementId), level);
        }
    } else {
        this.data.set(this.achievementStateProp(achievementId), {level: level, last_reward: null});
    }
};
