var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var AddAchievementCommand = helper.require('game/commands/addAchievementCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('AddAchievementCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            game_balance: 0,
            real_balance: 0,
            achievements: {},
            cafe: {}
        };
        this.state = new State(this.userId, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
    });

    describe('.validateParams', function() {
        it('returns true on valid params', function() {
            AddAchievementCommand.validateParams({achievement: 'collect_blue_cakes', level: 'gold'}).should.be.true;
        });

        it('returns false on invalid params', function() {
            AddAchievementCommand.validateParams().should.be.false;
            AddAchievementCommand.validateParams({}).should.be.false;
            AddAchievementCommand.validateParams({achievement: 'collect_blue_cakes'}).should.be.false;
            AddAchievementCommand.validateParams({level: 'gold'}).should.be.false;
        });
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
        });

        it('throws on activate unexisting achievement def', function() {
            var self = this;
            (function() {
                AddAchievementCommand.execute(self.state, {achievement: 'unknown_achievement', level: 'gold'});
            }).should.throw(GameLogicError);
        });

        it('throws on activate unexisting achievement level def', function() {
            var self = this;
            (function() {
                AddAchievementCommand.execute(self.state, {achievement: 'collect_blue_cakes', level: 'unknown_level'});
            }).should.throw(GameLogicError);
        });

        it('updates achievement in state', function() {
            AddAchievementCommand.execute(this.state, {achievement: "collect_blue_cakes", level: "silver"});
            this.state.data.get('achievements.collect_blue_cakes').should.deep.equal({"level": "silver", "last_reward": null});
        });

        context('when called with non-increased level', function() {
            it('does not change achievement in state', function() {
                AddAchievementCommand.execute(this.state, {achievement: "collect_blue_cakes", level: "platinum"});
                AddAchievementCommand.execute(this.state, {achievement: "collect_blue_cakes", level: "bronze"});
                this.state.data.get('achievements.collect_blue_cakes').should.deep.equal({"level": "platinum", "last_reward": null});
            });
        });
    });
});
