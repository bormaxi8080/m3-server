var helper = require('../../../helper.js');

var GameLogicError = helper.require('gameLogicError.js');

var BuyLifeCommand = helper.require('game/commands/buyLifeCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

var clone = require('node-v8-clone').clone;

describe('BuyLifeCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId
        };
        this.state = new State(this.userId, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
    });

    describe('.validateParams', function() {
        it('always returns true', function() {
            BuyLifeCommand.validateParams().should.be.true;
        });
    });

    describe('.execute', function() {
        context('when balance is positive', function() {
            beforeEach(function() {
                this.state.data.set('real_balance', 100);
                this.reduceBalance = helper.sandbox.stub(this.state.player, 'reduceBalance');
                this.addEvent = helper.sandbox.stub(this.state, 'addEvent');
            });

            context('when has active life action', function() {
                beforeEach(function() {
                    helper.sandbox.stub(this.state.defs.raw, "actions", {
                        action_1: {
                            effects: {
                                life: {
                                    price: {
                                        real_balance: 30
                                    }
                                }
                            }
                        }
                    });

                    this.state.cache.buildCache(this.state.defs);
                });

                it('reduceBalance and addEvent when execute', function() {
                    var price = this.state.defs.get('actions.action_1.effects.life.price');
                    BuyLifeCommand.execute(this.state);
                    this.reduceBalance.should.be.calledWith(price);
                    this.addEvent.should.be.calledWith('add_life', 1);
                });
            });

            context('when has no active life action', function() {
                beforeEach(function() {
                    this.state.defs.raw.actions = {};
                    this.state.cache.buildCache(this.state.defs);
                });

                it('reduceBalance and addEvent when execute', function() {
                    var price = clone(this.state.defs.get('life.price'), true);
                    BuyLifeCommand.execute(this.state);
                    this.reduceBalance.should.be.calledWith(price);
                    this.addEvent.should.be.calledWith('add_life', 1);
                });
            });
        });

        context('then balance is zero', function() {
            beforeEach(function() {
                this.state.data.set('real_balance', 0);
            });

            it('throws if not enough balance to buy', function() {
                var self = this;
                (function() {
                    BuyLifeCommand.execute(self.state);
                }).should.throw(GameLogicError);
            });
        });
    });
});
