var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var GameLogicError = helper.require('gameLogicError.js');

var BuyBoosterPackCommand = helper.require('game/commands/buyBoosterPackCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('BuyBoosterPackCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            progress: 5
        };
        this.state = new State(this.userId, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
    });

    describe('.validateParams', function() {
        it('returns true on valid params', function() {
            BuyBoosterPackCommand.validateParams({name: 'pastry_tongs'}).should.be.true;
        });

        it('returns false on invalid params', function() {
            BuyBoosterPackCommand.validateParams().should.be.false;
            BuyBoosterPackCommand.validateParams({}).should.be.false;
        });
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
        });

        context('when balance is positive', function() {
            beforeEach(function() {
                this.state.data.set('real_balance', 100);
                this.reduceBalance = helper.sandbox.stub(this.state.player, 'reduceBalance');
            });

            context('when has active booster pack actions', function() {
                beforeEach(function() {
                    helper.sandbox.stub(this.state.defs.raw, "actions", {
                        action_1: {
                            effects: {
                                booster_packs: {
                                    pastry_tongs: {
                                        price: {
                                            real_balance: 5
                                        }
                                    },
                                    gingerbread_man: {
                                        contents: {
                                            gingerbread_man: 1,
                                            pastry_tongs: 1
                                        }
                                    }
                                }
                            }
                        }
                    });

                    this.state.cache.buildCache(this.state.defs);
                });

                it('reduces balance correctly then buying booster pack', function() {
                    BuyBoosterPackCommand.execute(this.state, {name: "pastry_tongs"});
                    this.reduceBalance.should.be.calledWith({real_balance: 5});
                });

                it('correct events object added in state then buying booster pack', function() {
                    BuyBoosterPackCommand.execute(this.state, {name: "gingerbread_man"});
                    var events = this.state.events;
                    events.should.be.an.Array;
                    events.should.have.length(1);
                    events[0].should.deep.equal({
                        add_boosters: {
                            gingerbread_man: {count: 1},
                            pastry_tongs: {count: 1}
                        }
                    });
                });
            });

            context('when has no active booster pack actions', function() {
                beforeEach(function() {
                    this.state.defs.raw.actions = {};
                    this.state.cache.buildCache(this.state.defs);
                });

                it('reduces balance correctly then buying booster pack', function() {
                    BuyBoosterPackCommand.execute(this.state, {name: 'pastry_tongs'});
                    this.reduceBalance.should.be.calledWith({real_balance: 10});
                });
            });

            it('correct events object added in state on buying booster pack', function() {
                BuyBoosterPackCommand.execute(this.state, {name: 'pastry_tongs'});
                var events = this.state.events;
                events.should.be.an.Array;
                events.should.have.length(1);
                events[0].should.deep.equal({add_boosters: {pastry_tongs: {count: 1}}});
            });

            it('throws when buying unexisting booster pack def', function() {
                var self = this;
                (function() {
                    BuyBoosterPackCommand.execute(self.state, {name: 'unknown_pack', amount: 1});
                }).should.throw(GameLogicError);
            });

            it('throws when buying booster pack that requires more than current progress', function() {
                var self = this;
                (function() {
                    BuyBoosterPackCommand.execute(self.state, {name: 'extra_moves'});
                }).should.throw(GameLogicError);
            });
        });

        context('whan is not enough balance to buy', function() {
            beforeEach(function() {
                this.state.data.set('real_balance', 0);
            });

            it('throws if not enough balance to buy', function() {
                var self = this;
                (function() {
                    BuyBoosterPackCommand.execute(self.state, {name: 'pastry_tongs'});
                }).should.throw(GameLogicError);
            });
        });
    });
});
