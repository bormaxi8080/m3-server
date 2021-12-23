var MethodAccessorGenerator = require('../methodAccessorGenerator.js');

var Unlocks = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.defs = state.defs;
};

MethodAccessorGenerator.injectDefAccessor(Unlocks.prototype, "unlock", "Unlocks", "unlocks");
