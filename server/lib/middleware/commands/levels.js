var _ = require('lodash');
var async = require('async');
var Base = require('../../net/commandsMiddlewareBase');

var LevelsCommandMiddleware = module.exports = Base(function(core) {
    this.core = core;
});

LevelsCommandMiddleware.prototype.beforePrepareState = function(userId, commands, trx, callback) {
    var levels = _.uniq(commands.map(function(command) {
        return command.params.level;
    }));

    if (levels.length) {
        this.core.levelManager.fetchLevels(userId, levels, trx, callback);
    } else {
        callback();
    }
};

LevelsCommandMiddleware.prototype.prepareState = function(state, result) {
    if (result) {
        state.levels.levels = result;
    }
};

LevelsCommandMiddleware.prototype.getFinalizeTasks = function(state, trx) {
    var self = this;
    var tasks = [];
    var levels = state.levels.levels;
    if (!_.isEmpty(levels)) {
        var newLevels = state.levels.newLevels;

        var createLevels = newLevels.reduce(function(memo, id) {
            memo[id] = levels[id];
            return memo;
        }, {});

        var updateLevels = Object.keys(levels).filter(function(id) {
            return createLevels[id] === undefined;
        }).reduce(function(memo, id) {
            memo[id] = levels[id];
            return memo;
        }, {});

        if (!_.isEmpty(createLevels)) {
            tasks.push(function(cb) { self.core.levelManager.createLevels(state.id, createLevels, trx, cb); });
        }

        if (!_.isEmpty(updateLevels)) {
            tasks.push(function(cb) { self.core.levelManager.updateLevels(state.id, updateLevels, trx, cb); });
        }
    }

    if (state.levels.finish_times) {
        tasks = tasks.concat(self.updateSheduleTasks(
            state,
            state.levels.finish_times.oldTime,
            state.levels.finish_times.newTime,
            state.levels.finish_times.level
        ));
    }

    return tasks;
};

LevelsCommandMiddleware.prototype.updateSheduleTasks = function(state, oldTime, newTime, level) {
    var self = this;
    var code = 'last_finish_level';
    var tasks = [];

    var oldTime = _.clone(oldTime);
    var newTime = _.clone(newTime);

    if (oldTime) {
        oldTime.setHours( oldTime.getHours() + 72 );
        (function(oldTime) {
            tasks.push(function(cb) {
                self.core.sheduleManager.delSheduleKeyHash(code, oldTime, state.id, cb);
            });
        })(_.clone(oldTime));

        oldTime.setHours( oldTime.getHours() + 72 );
        (function(oldTime) {
            tasks.push(function(cb) {
                self.core.sheduleManager.delSheduleKeyHash(code, oldTime, state.id, cb);
            });
        })(_.clone(oldTime));
    }

    newTime.setHours( newTime.getHours() + 72 );
    (function(newTime) {
        tasks.push(function(cb) {
            self.core.sheduleManager.setSheduleKeyHash(code, newTime, state.id, level, cb);
        });
    })(_.clone(newTime));

    newTime.setHours( newTime.getHours() + 72 );
    (function(newTime) {
        tasks.push(function(cb) {
            self.core.sheduleManager.setSheduleKeyHash(code, newTime, state.id, level, cb);
        });
    })(_.clone(newTime));

    return tasks;
}
