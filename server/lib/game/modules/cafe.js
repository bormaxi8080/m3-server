var _ = require('lodash');

var MethodAccessorGenerator = require('../methodAccessorGenerator.js');

var AccessProtocolError = require('../../accessProtocolError.js');
var GameLogicError = require('../../gameLogicError.js');

var Cafe = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.defs = state.defs;
};

MethodAccessorGenerator.injectDefAccessor(Cafe.prototype, "item", "Cafe item", "cafe.items");
MethodAccessorGenerator.injectDefAccessor(Cafe.prototype, "itemType", "Cafe item type", "cafe.types");

MethodAccessorGenerator.injectStateAccessor(Cafe.prototype, "item", "Cafe item", "cafe.items");

Cafe.prototype.itemTypeByItem = function(item) {
    return this.itemType(this.item(item).type);
};

Cafe.prototype.itemGrades = function(item) {
    return this.itemTypeByItem(item).grades;
};

Cafe.prototype.itemStateGradesProp = function(item) {
    return this.itemStateProp(item) + ".grades";
};

Cafe.prototype.itemStateGrades = function(item) {
    return this.data.get(this.itemStateGradesProp(item));
};

Cafe.prototype.itemStateActiveGradeProp = function(item) {
    return this.itemStateProp(item) + ".active";
};

Cafe.prototype.itemStateActiveGrade = function(item) {
    return this.data.get(this.itemStateActiveGradeProp(item));
};

Cafe.prototype.unlockDef = function(level) {
    return this.defs.getOrDefault("cafe.unlocks." + level, []);
};

Cafe.prototype.unlockItem = function(item) {
    this.checkItemDefined(item);
    this.checkItemNotExists(item);
    this.data.set(this.itemStateProp(item), {grades:[0], active: 0});
};

Cafe.prototype.unlockItems = function(items) {
    if (!Array.isArray(items)) {
        throw new AccessProtocolError("Unlock items should be an array");
    }
    if (!items.length) return;
    var self = this;
    items.forEach(function(item) {
        self.unlockItem(item);
    });
};

Cafe.prototype.unlockItemsByLevel = function(level) {
    var levelUnlocks = this.unlockDef(level);
    this.unlockItems(levelUnlocks);
};
