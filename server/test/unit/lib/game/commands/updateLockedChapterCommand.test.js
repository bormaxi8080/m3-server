var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var GameLogicError = helper.require('gameLogicError.js');

var UpdateLockedChapterCommand = helper.require('game/commands/updateLockedChapterCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('UpdateLockedChapterCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            progress: 1
        };
        this.event = helper.sandbox.stub(Journal, "event");
    });

    describe('.validateParams', function() {
        it('always returns true', function() {
            UpdateLockedChapterCommand.validateParams().should.be.true;
        });
    });

    describe('.execute', function() {
        context('when has no locked chapter in state', function() {
            beforeEach(function() {
                this.data.chapters = {};
                this.state = new State(this.userId, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
            });

            it('throws if has no locked chapters', function() {
                var self = this;
                (function() {
                    UpdateLockedChapterCommand.execute(self.state, {});
                }).should.throw(GameLogicError);
            });
        });

        context('when has locked chapter in state', function() {
            beforeEach(function() {
                this.data.chapters = {
                    1: {
                        id: 1,
                        unlocks: ['relatives'],
                        unlocked: false,
                        unlock_on: Date.now() + 259200 * 1000
                    }
                };

                var dataWrapper = DefManager.loadStaticDefs();
                dataWrapper.readonly = false;

                this.state = new State(this.userId, this.data, dataWrapper, DefManager.loadStaticCache());
                this.state.defs.set("map", {
                    level_counter: 110,
                    chapter_counter: 10
                });
            });

            it('corectly unlocks chapter', function() {
                var timestamp = Date.now();
                UpdateLockedChapterCommand.execute(this.state, {unlocked: true, unlock_on: timestamp});
                this.state.data.get('chapters.1').should.deep.equal({
                    id: 1,
                    unlocked: true
                });
            });
        });
    });
});
