var path = require('path');
var _ = require('lodash');
var async = require('async');
var clone = require('node-v8-clone').clone;
var State = require('./game/state');
var utils = require('./utils');

var CommandProcessor = module.exports = function(core) {
    this.core = core;
    this.middleware = utils.requireInstances(core, path.join(__dirname, 'middleware/commands'));
    this.commands = require('./game/commands');

    if (this.core.inProduction) {
        this.commands = _.filter(this.commands, function(command) {
            return !command.nonProduction;
        });
    }
};

CommandProcessor.prototype.filterCommands = function(commands) {
    var index = _.findIndex(commands, function(command) {
        return !this.validateCommand(command);
    }, this);
    if (index >= 0) {
        return {
            commands: _.first(commands, index),
            error: {
                command: commands[index],
                message: 'Invalid command format or incorrect parameters'
            }
        };
    } else {
        return {
            commands: commands
        };
    }
};

CommandProcessor.prototype.validateCommand = function(command) {
    if (!utils.hasFields(command, ['id', 'name', 'params'])) {
        return false;
    }
    var commandHandler = this.commands[command.name];
    if (commandHandler) {
        return commandHandler.validateParams(command.params);
    }
    return false;
};

CommandProcessor.prototype.executeCommand = function(state, command) {
    this.commands[command.name].execute(state, command.params);
};

CommandProcessor.prototype.executeCommandList = function(state, commands) {
    var acceptedCommands = [];
    var result = {};

    var backupUserData = function(state) {
        return {
            userData: clone(state.data.raw, true),
            events: clone(state.events, true)
        };
    };

    var restoreUserData = function(state, backupData) {
        state.data.raw = backupData.userData;
        state.events = backupData.events;
    };

    var len = commands.length;
    for (var i = 0; i < len; ++i) {
        var backupData = backupUserData(state);

        var command = commands[i];
        try {
            this.executeCommand(state, command);
            acceptedCommands.push(command);
        } catch (err) {
            restoreUserData(state, backupData);
            this.core.logger.warn('ERROR EXECUTING COMMAND: ' + JSON.stringify(command) + '; ERROR: ' + err);
            if (err.stack) {
                this.core.logger.warn(err.stack);
            }
            break;
        }
    }

    return _.difference(commands, acceptedCommands);
};

CommandProcessor.prototype.process = function(userId, commands, callback) {
    var self = this;
    var result = {};

    var filteredResults = this.filterCommands(commands);
    var filteredCommands = filteredResults.commands;
    var rejectedCommands = _.difference(commands, filteredCommands);

    if (filteredResults.error) {
        this.core.logger.warn('ERROR VALIDATING COMMAND: ' + JSON.stringify(filteredResults.error.command) + '; ERROR: ' + filteredResults.error.message);
    }

    var data = {
        useMiddleware: {},
        commandsByMiddleware: {}
    };

    _.each(filteredCommands, function(cmd) {
        var name = cmd.name;
        var middlewareList = self.commands[name].middleware;
        if (Array.isArray(middlewareList)) {
            _.each(middlewareList, function(middleware) {
                data.useMiddleware[middleware] = true;
                if (!data.commandsByMiddleware[middleware]) {
                    data.commandsByMiddleware[middleware] = [];
                }
                data.commandsByMiddleware[middleware].push(cmd);
            });
        }
    });

    data.useMiddleware = _.keys(data.useMiddleware);

    this.core.multiKnex.transactionally(function(trx, cb) {
        async.waterfall([
            function(cb) { self.prepareData(userId, data, trx, cb); },
            function(state, cb) {
                result.rejected_commands = _.pluck(rejectedCommands.concat(self.executeCommandList(state, filteredCommands)), 'id');
                result.user_data = state.data.raw;
                result.events = state.events;
                result.defs_hash = self.core.defKeeper.defsHash(result.user_data);
                cb(null, state);
            },
            function(state, cb) { self.finalizeData(userId, state, data.useMiddleware, trx, cb); }
        ], cb);
    }, function(err) {
        callback(err, result);
    });
};

CommandProcessor.prototype.prepareData = function(userId, data, trx, callback) {
    var self = this;

    var tasks = {
        state: function(cb) { self.core.userManager.fetchUserState(userId, trx, cb); }
    };

    _.each(data.useMiddleware, function(name) {
        if ( self.middleware[name].beforePrepareState ) {
            tasks[name] = function(cb) {
                self.middleware[name].beforePrepareState(userId, data.commandsByMiddleware[name], trx, cb);
            };
        }
    });

    async.parallel(tasks, function(err, results) {
        var state = new State(userId, results.state, self.core.defKeeper.defs(results.state), self.core.defKeeper.cache(results.state));

        _.each(data.useMiddleware, function(name) {
            if (self.middleware[name].prepareState) {
                self.middleware[name].prepareState(state, results[name]);
            }
        });

        callback(err, state);
    });
};

CommandProcessor.prototype.finalizeData = function(userId, state, useMiddleware, trx, callback) {
    var self = this;

    var tasks = [
        function(cb) { self.core.userManager.updateUserState(userId, state.data.raw, trx, cb); }
    ];

    _.each(useMiddleware, function(name) {
        var finalizeTasks = self.middleware[name].getFinalizeTasks(state, trx);
        if (Array.isArray(finalizeTasks)) {
            tasks.push.apply(tasks, finalizeTasks);
        }
    });

    async.parallel(tasks, function(err) {
        callback(err, state);
    });
};
