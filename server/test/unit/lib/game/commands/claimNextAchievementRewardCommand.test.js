var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var ClaimNextAchievementRewardCommand = helper.require('game/commands/claimNextAchievementRewardCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('ClaimNextAchievementRewardCommand', function() {

    subject('command', function() {
        return ClaimNextAchievementRewardCommand;
    });

    beforeEach(function() {
        this.data = {
            game_balance: 0,
            real_balance: 0,
            achievements: {
                collect_blue_cakes: {
                    level: 'silver',
                    last_reward: null
                },
                pass_chapter_1: {
                    level: 'diamond',
                    last_reward: null
                },
                repair_cafe_entirely: {
                    level: 'diamond',
                    last_reward: 'diamond'
                }
            }
        };
        this.state = new State(1, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
        });

        it('throws on activate unexisting achievement def', function() {
            var self = this;
            (function() {
                self.command.execute(self.state, {achievement: 'unknown_achievement'});
            }).should.throw(GameLogicError);
        });

        it('increments last_reward level in state', function() {
            this.command.execute(this.state, {achievement: "collect_blue_cakes"});
            this.state.data.get('achievements.collect_blue_cakes.last_reward').should.equal("bronze");
        });

        it('applies corresponding level reward', function() {
            var applyReward = helper.sandbox.stub(this.state.player, 'applyReward');
            this.command.execute(this.state, {achievement: "collect_blue_cakes"});
            applyReward.should.be.calledWith({game_balance: 50});
        });

        it('jumps to next available level when levels are not sequential', function() {
            this.command.execute(this.state, {achievement: "pass_chapter_1"});
            this.state.data.get('achievements.pass_chapter_1.last_reward').should.deep.equal("diamond");
        });

        it('throws when reward for current level already received', function() {
            var self = this;
            (function() {
                self.command.execute(self.state, {achievement: "repair_cafe_entirely"});
            }).should.throw(GameLogicError);
        });
    });
});
