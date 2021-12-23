var helper = require('../../../helper');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('Player', function() {
    beforeEach(function() {
        this.state = new State();
        this.player = this.state.player;
    });

    describe('#accumulateReward', function() {
        it('adds only existing values', function() {
            this.player.accumulateReward({game_balance: 10}, {}).should.deep.equal({game_balance: 10});
        });

        it('adds all various rewards to accummulation', function() {
            this.player.accumulateReward({
                game_balance: 10,
                boosters: {booster_1: 3}
            }, {
                cafe: ['cafe_item_1']
            }).should.deep.equal({
                game_balance: 10,
                boosters: {booster_1: 3},
                cafe: ['cafe_item_1']
            });
        });

        it('sums rewards of same type', function() {
            this.player.accumulateReward({
                real_balance: 10,
                boosters: {booster_1: 3, booster_2: 1},
                cafe: ['cafe_item_1']
            }, {
                real_balance: 20,
                boosters: {booster_1: 2},
                cafe: ['cafe_item_2']
            }).should.deep.equal({
                real_balance: 30,
                boosters: {booster_1: 5, booster_2: 1},
                cafe: ['cafe_item_1', 'cafe_item_2']
            });
        });
    });

    describe('#applyReward', function() {
        it('adds balance', function() {
            var balance = {game_balance: 10, real_balance: 20};
            var addBalance = helper.sandbox.stub(this.state.player, 'addBalance');
            this.player.applyReward(balance);
            addBalance.should.be.calledWith(balance);
        });

        it('adds boosters', function() {
            var boosters = {booster_1: 5};
            var addBoosterPack = helper.sandbox.stub(this.state.player, 'addBoosterPack');
            this.player.applyReward({boosters: boosters});
            addBoosterPack.should.be.calledWith(boosters);
        });

        it('unlocks cafe items', function() {
            var unlockItems = helper.sandbox.stub(this.state.cafe, 'unlockItems');
            var items = ['cafe_item_1'];

            this.player.applyReward({cafe: items});
            unlockItems.should.be.calledWith(items);
        });
    });
});
