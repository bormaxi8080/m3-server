var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var GameLogicError = helper.require('gameLogicError.js');

var UnlockChapterCommand = helper.require('game/commands/unlockChapterCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('UnlockChapterCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            progress: 1
        };
        this.event = helper.sandbox.stub(Journal, "event");
    });

    var createState = function(userId, data) {
        var dataWrapper = DefManager.loadStaticDefs();
        dataWrapper.readonly = false;

        var state = new State(userId, data, dataWrapper, DefManager.loadStaticCache());
        state.defs.set("map", {
            level_counter: 110,
            chapter_counter: 10
        });

        return state;
    };

    describe('.validateParams', function() {
        it('always returns true', function() {
            UnlockChapterCommand.validateParams().should.be.true;
        });
    });

    describe('.execute', function() {
        context('when has locked chapter in state', function() {

            it('throws if has no unlocks and unlock time is on', function() {
                var self = this;
                self.data.chapters = {
                    1: {
                        id: 1,
                        unlocked: true
                    },
                    2: {
                        id: 2,
                        unlocked: true
                    },
                    3: {
                        id: 3,
                        unlocks: [],
                        unlocked: false,
                        unlock_on: Date.now() + 259200 * 1000
                    }
                };
                this.state = createState(this.userId, this.data);

                (function() {
                    UnlockChapterCommand.execute(self.state, {});
                }).should.throw(GameLogicError);
            });

            it('success if has needed unlocks count', function() {
                this.data.chapters = {
                    1: {
                        id: 1,
                        unlocked: true
                    },
                    2: {
                        id: 2,
                        unlocked: true
                    },
                    3: {
                        id: 3,
                        unlocks: ['relatives', 'relatives'],
                        unlocked: false,
                        unlock_on: Date.now() + 259200 * 1000
                    }
                };
                this.state = createState(this.userId, this.data);

                UnlockChapterCommand.execute(this.state, {});
                this.state.data.get('chapters.1.unlocked').should.be.true;
            });

            it('success if unlock time is off', function() {
                this.data.chapters = {
                    1: {
                        id: 1,
                        unlocked: true
                    },
                    2: {
                        id: 2,
                        unlocked: true
                    },
                    3: {
                        id: 3,
                        unlocks: [],
                        unlocked: false,
                        unlock_on: Date.now() - 259200 * 1000
                    }
                };
                this.state = createState(this.userId, this.data);

                UnlockChapterCommand.execute(this.state, {});
                this.state.data.get('chapters.1.unlocked').should.be.true;
            });
        });

        context('when has no locked chapter in state', function() {
            beforeEach(function() {
                this.data.chapters = {
                    1: {
                        id: 1,
                        unlocked: true
                    }
                };
                this.state = createState(this.userId, this.data);
            });

            it('throws because has no locked chapters', function() {
                var self = this;
                (function() {
                    UnlockChapterCommand.execute(self.state, {});
                }).should.throw(GameLogicError);
            });
         });
    });
});
