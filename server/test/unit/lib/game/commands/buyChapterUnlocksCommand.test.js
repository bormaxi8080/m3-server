var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var BuyChapterUnlocksCommand = helper.require('game/commands/buyChapterUnlocksCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('BuyChapterUnlocksCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            chapters: {
                1: {
                    id: 1,
                    unlocked: true
                },
                2: {
                    id: 2,
                    unlocked: true
                }
            },
            progress: 20,
            real_balance: 0
        };
        this.state = new State(this.userId, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
    });

    describe('.validateParams', function() {
        it('always returns true', function() {
            BuyChapterUnlocksCommand.validateParams().should.be.true;
        });
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
        });

        context('when has no locked chapter', function() {
            it('throws on any value', function() {
                var self = this;
                (function() {
                    BuyChapterUnlocksCommand.execute(self.state, {});
                }).should.throw(GameLogicError);
            });
        });

        context('when has locked chapter', function() {
            beforeEach(function() {
                this.state.chapter.addChapter(3);
            });

            context('when there is a desired count of unlocks', function() {
                beforeEach(function() {
                    this.state.chapter.addUnlock(3, 'relatives');
                });

                it('throws if a desired count of unlocks', function() {
                    var self = this;
                    (function() {
                        BuyChapterUnlocksCommand.execute(self.state, {});
                    }).should.throw(GameLogicError);
                });
            });

            context('when balance is positive', function() {
                beforeEach(function() {
                    this.state.data.set('real_balance', 100);
                    this.reduceBalance = helper.sandbox.stub(this.state.player, 'reduceBalance');
                });

                context('when has active chapter unlock actions', function() {
                    beforeEach(function() {
                        helper.sandbox.stub(this.state.defs.raw, "actions", {
                            action_1: {
                                effects: {
                                    unlocks: {
                                        2: {
                                            price: {
                                                real_balance: 10
                                            }
                                        },
                                        3: {
                                            price: {
                                                real_balance: 15
                                            }
                                        }
                                    }
                                }
                            }
                        });

                        this.state.cache.buildCache(this.state.defs);
                    });

                    it('reduces balance correctly on buying unlocks', function() {
                        var chapterId = this.state.chapter.getLockedChapter().id;
                        BuyChapterUnlocksCommand.execute(this.state, {});
                        this.reduceBalance.should.be.calledWith({real_balance: 10});
                    });
                });

                context('when has no active chapter unlock actions', function() {
                    beforeEach(function() {
                        this.state.defs.raw.actions = {};
                        this.state.cache.buildCache(this.state.defs);
                    });

                    it('reduces balance correctly on buying unlocks', function() {
                        var chapterId = this.state.chapter.getLockedChapter().id;
                        BuyChapterUnlocksCommand.execute(this.state, {});
                        this.reduceBalance.should.be.calledWith({real_balance: this.state.defs.get('unlocks.' + this.state.defs.get('chapters.' + chapterId).unlocks_count + '.price.real_balance')});
                    });
                });

                it('updates unlocks in state', function() {
                    var chapterId = this.state.chapter.getLockedChapter().id;
                    BuyChapterUnlocksCommand.execute(this.state, {});
                    var unlocks = this.state.data.get('chapters.' + chapterId + '.unlocks');
                    unlocks.should.be.an.Array;
                    unlocks.should.have.length(this.state.defs.get('chapters.' + chapterId).unlocks_count);
                });

                it('lock chapter in state', function() {
                    var chapterId = this.state.chapter.getLockedChapter().id;
                    BuyChapterUnlocksCommand.execute(this.state, {});
                    this.state.data.get('chapters.' + chapterId + '.unlocked').should.be.false;
                });
            });

            context('when the balance is zero', function() {
                beforeEach(function() {
                    this.state.data.set('real_balance', 0);
                });

                it('throws if not enough balance to buy', function() {
                    var self = this;
                    (function() {
                        BuyChapterUnlocksCommand.execute(self.state, {});
                    }).should.throw(GameLogicError);
                });
            });
        });
    });
});
