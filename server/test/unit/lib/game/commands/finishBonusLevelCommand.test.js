var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var FinishBonusLevelCommand = helper.require('game/commands/finishBonusLevelCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('FinishBonusLevelCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            progress: 1,
            game_balance: 0,
            real_balance: 0,
            bonus_levels: {},
            chapters: {
                1: {
                    id: 1,
                    unlocked: true,
                }
            },
            events: []
        };

        var dataWrapper = DefManager.loadStaticDefs();
        dataWrapper.readonly = false;

        this.state = new State(this.userId, this.data, dataWrapper, DefManager.loadStaticCache());

        this.state.defs.set("map", {
            bonus_levels: {
                bonus_2: {
                    chapter_id: 2,
                    rewards: [
                        {game_balance: 10, boosters: {"pastry_tongs": 1, "rainbow_cake": 1}},
                        {game_balance: 10, real_balance: 10},
                        {real_balance: 10, boosters: {"pastry_tongs": 1, "rainbow_cake": 1, "confectionery_blade": 2}}
                ]}
            }
        });
    });

    describe(".validateParams", function() {
        it('returns true on valid params', function() {
            FinishBonusLevelCommand.validateParams({level: "bonus_1", score: 1000, rewards: [0, 1, 2]}).should.be.true;
        });

        it('returns false on invalid params', function() {
            FinishBonusLevelCommand.validateParams().should.be.false;
            FinishBonusLevelCommand.validateParams({}).should.be.false;
            FinishBonusLevelCommand.validateParams({level: "bonus_1"}).should.be.false;
            FinishBonusLevelCommand.validateParams({level: "bonus_1", score: 1000}).should.be.false;
            FinishBonusLevelCommand.validateParams({level: 1, score: "incorrect_score"}).should.be.false;
            FinishBonusLevelCommand.validateParams({level: 1, score: 1000, rewards: 1}).should.be.false;
        });
    });

    describe(".execute", function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
            this.applyReward = helper.sandbox.stub(this.state.player, 'applyReward');
        });

        it("throws if finishing unknown level", function() {
            var self = this;
            (function() {
                FinishBonusLevelCommand.execute(self.state, {level: "bonus_1", score: 1000, rewards: [0, 1]});
            }).should.throw(GameLogicError);
        });

        it("throws if chapter for bonus level is not in current user state", function() {
            var self = this;
            (function() {
                FinishBonusLevelCommand.execute(self.state, {level: "bonus_2", score: 1000, rewards: [0, 1]});
            }).should.throw(GameLogicError);
        });

        it("throws if chapter for bonus level is locked", function() {
            var self = this;
            this.state.data.set('chapters.2', {
                unlocked: false
            });
            (function() {
                FinishBonusLevelCommand.execute(self.state, {level: "bonus_2", score: 1000, rewards: [0, 1]});
            }).should.throw(GameLogicError);
        });

        context("when has unlocked chapter", function() {
            beforeEach(function() {
                this.state.data.set('chapters.2', {
                    unlocked: true
                });
            });

            it("bonus level successfully added in state", function() {
                FinishBonusLevelCommand.execute(this.state, {level: "bonus_2", score: 1000, rewards: [0, 1, 2]});
                this.state.data.get("bonus_levels").should.have.property("bonus_2");
                this.state.data.get('bonus_levels.bonus_2').should.deep.equal([0, 1, 2]);
            });

            it("applyReward method called with required aruments", function() {
                FinishBonusLevelCommand.execute(this.state, {level: "bonus_2", score: 1000, rewards: [0, 1, 2]});
                this.state.data.get("bonus_levels").should.have.property("bonus_2");
                this.applyReward.should.be.calledWith({
                    boosters: { confectionery_blade: 2, pastry_tongs: 2, rainbow_cake: 2 },
                    game_balance: 20,
                    real_balance: 20
                });
            });
        });
    });

});
