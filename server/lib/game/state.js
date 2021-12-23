var _ = require('lodash');
var modules = require('./modules');
var DataWrapper = require('./dataWrapper');

var State = module.exports = function(id, data, defs, cache) {
    this.id = id;
    this.data = new DataWrapper(data);
    this.defs = defs;
    this.cache = cache;
    this.events = [];
    _.each(modules, function(module, name) {
        this[name] = new module(this);
    }, this);
};

State.prototype.addEvent = function(name, value) {
    var obj = {};
    obj[name] = value;
    this.events.push(obj);
};
