var _ = require('lodash');

var DataWrapper = require('../game/dataWrapper');

var ActionsCache = module.exports = function() {
    this.reserveInterval = 28800;  // 8h
    this.cache = {};
};

ActionsCache.prototype.makeIntervals = function(actions) {
    var self = this;
    var starts = _.compact(_.pluck(actions, "start_time"));
    var ends = _.map(_.compact(_.pluck(actions, "end_time")), function(endTime) {
        return endTime + (self.reserveInterval * 1000);
    });
    return _.sortBy(_.uniq(_.union(starts, ends, [0, Infinity])));
};

ActionsCache.prototype.buildCache = function(actions) {
    var self = this;

    var cache = {};
    var dates = this.makeIntervals(actions);

    for (var i = 1; i < dates.length; ++i) {
        var startTime = dates[i - 1];
        var endTime = dates[i];
        var cacheKey = startTime + "_" + endTime;

        var intervalEffects = _.reduce(actions, function(memo, action, actionName) {
            var actionStartTime = action.start_time || 0;
            var actionEndTime = action.end_time ? action.end_time + (self.reserveInterval * 1000) : Infinity;

            if (actionStartTime <= startTime && actionEndTime >= endTime) {
                _.each(action.effects, function(effect, type) {
                    memo[type] = _.extend((memo[type] || {}), effect);
                });
            }
            return memo;
        }, {});

        cache[cacheKey] = {
            start_time: startTime,
            end_time: endTime,
            effects: intervalEffects
        };
    };

    this.cache = new DataWrapper(cache);
};

ActionsCache.prototype.getInterval = function(timestamp) {
    var self = this;
    return _.findKey(this.cache.raw, function(interval) {
        return (interval.start_time <= timestamp) && (timestamp <= (interval.end_time || Infinity));
    });
};

ActionsCache.prototype.getProductEffect = function(product, timestamp) {
    return this.getCachedEffectValue("products." + product, timestamp || Date.now());
};

ActionsCache.prototype.getBoostersEffect = function(boosterPack, timestamp) {
    return this.getCachedEffectValue("booster_packs." + boosterPack, timestamp || Date.now());
};

ActionsCache.prototype.getUnlocksEffect = function(unlocksCount, timestamp) {
    return this.getCachedEffectValue("unlocks." + unlocksCount, timestamp || Date.now());
};

ActionsCache.prototype.getLifeEffect = function(timestamp) {
    return this.getCachedEffectValue("life", timestamp || Date.now());
};

ActionsCache.prototype.getInviteEffect = function(timestamp) {
    return this.getCachedEffectValue("invite", timestamp || Date.now());
};

ActionsCache.prototype.getCachedEffectValue = function(key, timestamp) {
    var interval = this.getInterval(timestamp || Date.now());
    return this.cache.getOrDefault(interval + ".effects." + key, {});
}