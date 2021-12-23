var Utils = require('../../utils');

var BuyBoosterPackCommand = module.exports = {};

BuyBoosterPackCommand.validateParams = function(params) {
    return Utils.hasFields(params, ['name']);
};

BuyBoosterPackCommand.execute = function(state, params) {
    state.player.buyBoosterPack(params.name);
};
