var _ = require('lodash');
var async = require('async');
var domain = require('domain');

var Journal = module.exports = function(core) {
    this.core = core;
    this.eventStore = [];
};

Journal.event = function(name, event) {
    if (typeof name !== 'string') {
        throw new Error("Incorrect event type, string expected");
    }

    if (!domain.active) {
        throw new Error("Domain missing");
    } else if (!domain.active.task) {
        throw new Error("Task missing in domain");
    } else {
        domain.active.task.journal.event(name, event);
    }
};

Journal.prototype.event = function(name, event) {
    this.eventStore.push([name, event]);
};

Journal.prototype.flush = function(userId, sessionId, callback) {
    this.core.journalManager.write(userId, sessionId, this.eventStore, callback);
};
