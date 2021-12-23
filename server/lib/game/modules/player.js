var _ = require('lodash');

var GameLogicError = require('../../gameLogicError.js');
var Journal = require('./../../journal');
var Utils = require('../../utils.js');

var Player = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.defs = state.defs;
};

Player.prototype.getProgress = function() {
    return this.data.get("progress");
};

Player.prototype.setProgress = function(value) {
    var oldProgress = this.getProgress();
    if (value > oldProgress) {
        var stateLevels = this.state.levels;
        if (!stateLevels.finish_times) {
            stateLevels.finish_times = {};
        }
        if (!stateLevels.finish_times.hasOwnProperty('oldTime')) {
            stateLevels.finish_times.oldTime = this.data.getOrDefault('finish_level_time', false);
        }
        var newFinishTime = new Date();
        this.data.set('finish_level_time', newFinishTime);
        stateLevels.finish_times.newTime = newFinishTime;
        stateLevels.finish_times.level = value;
    }
    this.data.set("progress", value);
};

Player.prototype.getGameBalance = function() {
    return this.data.get("game_balance") || 0;
};

Player.prototype.getRealBalance = function() {
    return this.data.get("real_balance") || 0;
};

Player.prototype.setGameBalance = function(value) {
    var oldBalance = this.getGameBalance();
    this.data.set("game_balance", value);
    Journal.event('set_game_balance', {old_balance: oldBalance, new_balance: value});
};

Player.prototype.addGameBalance = function(value) {
    if (value === 0) return;
    this.checkBalanceIsValid(value);
    this.setGameBalance(this.getGameBalance() + value);
};

Player.prototype.reduceGameBalance = function(value) {
    if (value === 0) return;
    this.checkBalanceIsValid(value);
    this.checkGameBalance(value);
    this.setGameBalance(this.getGameBalance() - value);
};

Player.prototype.checkGameBalance = function(value) {
    var currentBalance = this.getGameBalance();
    if (currentBalance < value) {
        throw new GameLogicError('Required game_balance: ' + value + '. Current game_balance is: ' + currentBalance);
    }
};

Player.prototype.checkRealBalance = function(value) {
    var currentBalance = this.getRealBalance();
    if (currentBalance < value) {
        throw new GameLogicError('Required real_balance: ' + value + '. Current real_balance is: ' + currentBalance);
    }
};

Player.prototype.checkProgress = function(value) {
    var currentProgress = this.getProgress();
    if (currentProgress < value) {
        throw new GameLogicError('Required progress: ' + value + '. Current progress is: ' + currentProgress);
    }
};

Player.prototype.setRealBalance = function(value) {
    var oldBalance = this.getRealBalance();
    this.data.set("real_balance", value);
    Journal.event('set_real_balance', {old_balance: oldBalance, new_balance: value});
};

Player.prototype.checkBalanceIsValid = function(value) {
    if (!Utils.isInteger(value) || value < 0) {
        throw new GameLogicError('Incorrect balance: ' + value);
    }
};

Player.prototype.addRealBalance = function(value) {
    if (value === 0) return;
    this.checkBalanceIsValid(value);
    this.setRealBalance(this.getRealBalance() + value);
};

Player.prototype.reduceRealBalance = function(value) {
    if (value === 0) return;
    this.checkBalanceIsValid(value);
    this.checkRealBalance(value);
    this.setRealBalance(this.getRealBalance() - value);
};

Player.prototype.addBalance = function(balance) {
    if (balance.game_balance) {
        this.addGameBalance(balance.game_balance);
    }
    if (balance.real_balance) {
        this.addRealBalance(balance.real_balance);
    }
};

Player.prototype.reduceBalance = function(balance) {
    if (balance.game_balance) {
        this.reduceGameBalance(balance.game_balance);
    }
    if (balance.real_balance) {
        this.reduceRealBalance(balance.real_balance);
    }
};

Player.prototype.multiplyBoosterPack = function(boosters, amount) {
    return _.reduce(boosters, function(result, num, key) {
        if (!result[key]) {
            result[key] = {count: 0};
        }
        result[key].count += num * amount;
        return result;
    }, {});
};

Player.prototype.addBoosterPack = function(contents) {
    if (_.isEmpty(contents)) return;
    this.state.addEvent('add_boosters', this.multiplyBoosterPack(contents, 1));
};

Player.prototype.getBoosterPackDef = function(name) {
    return this.defs.get("booster_packs." + name);
};

Player.prototype.hasBoosterPackDef = function(name) {
    return this.defs.has('booster_packs.' + name);
};

Player.prototype.checkBoosterPackDefExists = function(name) {
    if (!this.hasBoosterPackDef(name)) {
        throw new GameLogicError('Booster pack def is not found: ' + name);
    }
};

Player.prototype.checkBoosters = function(boosters) {
    var self = this;
    _.each(boosters, function(count, boosterName) {
        var booster = self.defs.get("boosters." + boosterName);
        if (booster.require && booster.require.level) {
            self.checkProgress(booster.require.level);
        }
    });
};

Player.prototype.buyBoosterPack = function(name) {
    this.checkBoosterPackDefExists(name);

    var boosterPack = this.getBoosterPackDef(name);
    var price = boosterPack.price;
    var contents = boosterPack.contents;

    var effect = this.state.cache.actionsCache.getBoostersEffect(name, Date.now());
    if (effect.price) { price = effect.price; }
    if (effect.contents) { contents = effect.contents; }

    this.checkBoosters(contents);

    this.reduceBalance(price);
    this.addBoosterPack(contents);

    Journal.event('buy_booster_pack', {
        name: name,
        contents: contents
    });
};

Player.prototype.applyReward = function(reward) {
    this.addBalance(reward);
    if (reward.boosters) {
        this.addBoosterPack(reward.boosters);
    }
    if (reward.cafe) {
        this.state.cafe.unlockItems(reward.cafe);
    }
};

Player.prototype.accumulateReward = function(memo, reward) {
    ['game_balance', 'real_balance'].forEach(function(balance) {
        if (reward[balance]) {
            memo[balance] = (memo[balance] || 0) + reward[balance];
        }
    });

    if (reward.boosters) {
        memo.boosters = _.reduce(reward.boosters, function(memo, count, booster) {
            memo[booster] = (memo[booster] || 0) + count;
            return memo;
        }, memo.boosters || {});
    }

    if (reward.cafe) {
        memo.cafe = (memo.cafe || []).concat(reward.cafe);
    }

    return memo;
};

Player.prototype.reduceReward = function(rewards) {
    var self = this;
    return rewards.reduce(function(result, reward) {
        return self.accumulateReward(result, reward);
    }, {});
};
