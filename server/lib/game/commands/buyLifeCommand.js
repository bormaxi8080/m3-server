var BuyLifeCommand = module.exports = {};

BuyLifeCommand.validateParams = function(params) {
    return true;
};

BuyLifeCommand.execute = function(state, params) {
    var price = state.defs.get('life.price');
    var effect = state.cache.actionsCache.getLifeEffect(Date.now());
    if (effect.price) {
        price = effect.price;
    }
    state.player.reduceBalance(price);
    if (effect.reward) {
        state.player.applyReward(effect.reward);
    }
    state.addEvent('add_life', 1);
};
