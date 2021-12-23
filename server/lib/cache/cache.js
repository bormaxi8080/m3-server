var ActionsCache = require('./actionsCache.js');

var Cache = module.exports = function(defs) {
    this.defs = defs;
    this.actionsCache = new ActionsCache();
    this.buildCache(defs);
};

Cache.prototype.buildCache = function(defs) {
    this.actionsCache.buildCache(defs.raw.actions);
};
