var _ = require('lodash');

var MethodAccessorGenerator = require('../methodAccessorGenerator.js');

var Action = module.exports = function(state) {
    this.state = state;
    this.defs = state.defs;
    this.reserveInterval = 28800;  // 8h
};

MethodAccessorGenerator.injectDefAccessor(Action.prototype, "action", "Action", "actions");

Action.prototype.started = function(action) {
    if (!action.start_time) { return true; }
    return action.start_time < Date.now();
};

Action.prototype.finished = function(action) {
    if (!action.end_time) { return false; }
    return action.end_time + (this.reserveInterval * 1000) < Date.now();
};

Action.prototype.active = function(action) {
    return this.started(action) && !this.finished(action);
};
