var _ = require('lodash');
var utils = require('../utils');

var Map = module.exports = function(rawMap) {
    this.chapterCounter = 0;
    this.levelCounter = 0;
    this.levelHashes = {};
    this.levelIndexes = {};
    this.chapterHashes = {};
    this.bonusLevels = {};
    this.map = {};
    this.levels = {};
    this.levelRewards = [{game_balance: 50}, {game_balance: 100}, {game_balance: 200}];
    this.parse(rawMap);
};

Map.prototype.extractLevelScores = function() {
    var self = this;
    return _.reduce(this.levelIndexes, function(memo, levelIndex, index) {
        memo[index] = {};
        memo[index].chapter_id = levelIndex.chapter_id;
        memo[index].scores = levelIndex.level.scores.map(function(score, scoreIndex) {
            return {score: score, reward: self.levelRewards[scoreIndex]};
        });
        return memo;
    }, {});
};

Map.prototype.extractBonusLevels = function() {
    var self = this;
    return _.reduce(this.bonusLevels, function(memo, bonusLevelInfo) {
        memo[bonusLevelInfo.id] = {
            chapter_id: bonusLevelInfo.chapterId,
            rewards: bonusLevelInfo.level.rewards
        };
        return memo;
    }, {});
};

Map.prototype.foldPlainLevel = function(chapterId, level) {
    var id = ++(this.levelCounter);
    var hash = utils.hashObject(level);
    this.levelIndexes[id] = {chapter_id: chapterId, level: level};
    this.levelHashes[hash] = level;
    return  {id: id, hash: hash, type: this.extractLevelType(level)};
};

Map.prototype.foldSpecialLevel = function(chapterId, level) {
    var bonusLevelId = "bonus_" + chapterId;
    var hash = utils.hashObject(level);
    this.levelHashes[hash] = level;
    this.bonusLevels[chapterId] = {chapterId: chapterId, level: level, id: bonusLevelId};
    return {hash: hash, id: bonusLevelId};
};

Map.prototype.foldChapter = function(chapter) {
    var self = this;
    var id = ++(self.chapterCounter);
    var foldedChapter = {
        id: id,
        levels: chapter.levels.map(function(level) {
            return self.foldPlainLevel(id, level);
        }),
    };

    if (chapter.bonus_level) {
        foldedChapter.bonus_level = self.foldSpecialLevel(id, chapter.bonus_level);
    }

    var chapterLevelHashes = self.chapterLevelHashes(foldedChapter);
    var chapterHash = utils.hashObject(chapterLevelHashes);
    self.chapterHashes[chapterHash] = chapterLevelHashes;

    foldedChapter.hash = chapterHash;
    return foldedChapter;
};

Map.prototype.chapterLevelHashes = function(chapter) {
    var self = this;
    var initArray = chapter.bonus_level ? [chapter.bonus_level.hash] : [];
    return initArray.concat(chapter.levels.map(function(level) {
        return level.hash;
    })).reduce(function(memo, hash) {
        memo[hash] = self.levelHashes[hash];
        return memo;
    }, {});
};

Map.prototype.parse = function(rawMap) {
    var self = this;

    var chapters = rawMap.chapters.map(function(chapter) {
        return self.foldChapter(chapter);
    });

    this.mapscreen = {chapters: chapters};
    this.levels = this.extractLevelScores();
    this.bonus_levels = this.extractBonusLevels();
};

Map.prototype.extractLevelType = function(level) {
    if (level.objectives.get_ingredients) {
        return "get_ingredients";
    } else if (level.objectives.clearbacks) {
        return "clearbacks";
    } else if (level.objectives.get_colors) {
        return "get_colors";
    } else if (level.objectives.toys) {
        return "toys";
    } else if (level.boss) {
        return "boss_level";
    } else if (level.limit.time) {
        return "time_limit";
    }else if (level.limit.moves) {
        return "moves_limit";
    }
};
