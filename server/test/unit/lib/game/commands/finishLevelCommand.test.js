var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var FinishLevelCommand = helper.require('game/commands/finishLevelCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('FinishLevelCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            progress: 1,
            game_balance: 0,
            real_balance: 0,
            chapters: {
                1: {
                    id: 1,
                    unlocked: true,
                }
            }
        };

        var dataWrapper = DefManager.loadStaticDefs();
        dataWrapper.readonly = false;

        this.state = new State(this.userId, this.data, dataWrapper, DefManager.loadStaticCache());
        this.state.defs.set("map", {
            level_counter: 8,
            chapter_counter: 2,
            levels: {
                1: {chapter_id: 1, scores: [
                    {score: 300, reward: {game_balance: 20, real_balance: 10}},
                    {score: 400, reward: {game_balance: 20, real_balance: 10}},
                    {score: 500, reward: {game_balance: 20, real_balance: 10}}]},
                2: {chapter_id: 1, scores: [
                    {score: 300, reward: {game_balance: 20, real_balance: 10}},
                    {score: 400, reward: {game_balance: 20, real_balance: 10}},
                    {score: 500, reward: {game_balance: 20, real_balance: 10}}]},
                3: {chapter_id: 2, scores: [
                    {score: 300, reward: {game_balance: 20, real_balance: 10}},
                    {score: 400, reward: {game_balance: 20, real_balance: 10}},
                    {score: 500, reward: {game_balance: 20, real_balance: 10}}]},
                4: {chapter_id: 2, scores: [
                    {score: 300, reward: {game_balance: 20, real_balance: 10}},
                    {score: 400, reward: {game_balance: 20, real_balance: 10}},
                    {score: 500, reward: {game_balance: 20, real_balance: 10}}]},
                5: {chapter_id: 2, scores: [
                    {score: 300, reward: {game_balance: 20, real_balance: 10}},
                    {score: 400, reward: {game_balance: 20, real_balance: 10}},
                    {score: 500, reward: {game_balance: 20, real_balance: 10}}]},
                6: {chapter_id: 2, scores: [
                    {score: 300, reward: {game_balance: 20, real_balance: 10}},
                    {score: 400, reward: {game_balance: 20, real_balance: 10}},
                    {score: 500, reward: {game_balance: 20, real_balance: 10}}]},
                7: {chapter_id: 2, scores: [
                    {score: 300, reward: {game_balance: 20, real_balance: 10}},
                    {score: 400, reward: {game_balance: 20, real_balance: 10}},
                    {score: 500, reward: {game_balance: 20, real_balance: 10}}]},
                8: {chapter_id: 2, scores: [
                    {score: 300, reward: {game_balance: 20, real_balance: 10}},
                    {score: 400, reward: {game_balance: 20, real_balance: 10}},
                    {score: 500, reward: {game_balance: 20, real_balance: 10}}]}
            }
        });
    });

    describe('.validateParams', function() {
        it('returns true on valid params', function() {
            FinishLevelCommand.validateParams({level: 1, score: 500}).should.be.true;
        });

        it('returns false on invalid params', function() {
            FinishLevelCommand.validateParams().should.be.false;
            FinishLevelCommand.validateParams({}).should.be.false;
            FinishLevelCommand.validateParams({level: 1}).should.be.false;
            FinishLevelCommand.validateParams({score: 5000}).should.be.false;
            FinishLevelCommand.validateParams({level: 'incorect_level', score: 500}).should.be.false;
            FinishLevelCommand.validateParams({level: 1, score: 'incorrect_score'}).should.be.false;
        });
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
            this.applyReward = helper.sandbox.stub(this.state.player, 'applyReward');
        });

        it('new levels successfully adds in state', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 100});
            FinishLevelCommand.execute(this.state, {level: 2, score: 200});
            FinishLevelCommand.execute(this.state, {level: 2, score: 100});
            this.state.levels.newLevels.should.deep.equal([1, 2]);
        });

        it('level scores successfully writes in state', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 100});
            this.state.levels.levels.should.deep.equal({1: 100});

            FinishLevelCommand.execute(this.state, {level: 1, score: 200});
            this.state.levels.levels.should.deep.equal({1: 200});

            FinishLevelCommand.execute(this.state, {level: 1, score: 100});
            this.state.levels.levels.should.deep.equal({1: 200});
        });

        it('throws if finishing unknown level', function() {
            var self = this;
            (function() {
                FinishLevelCommand.execute(self.state, {level: 10000, score: 300});
            }).should.throw(AccessProtocolError);
        });

        it('progress incremented for new finishied level', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 100});
            this.state.data.get('progress').should.be.equal(2);
        });

        it('progress is not changed after repeatedly finished level', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 100});
            FinishLevelCommand.execute(this.state, {level: 1, score: 100});
            this.state.data.get('progress').should.be.equal(2);
        });

        it('progress is correct after last level finishing', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 300});
            FinishLevelCommand.execute(this.state, {level: 2, score: 300});
            this.state.data.set('chapters.2.unlocked', true);
            FinishLevelCommand.execute(this.state, {level: 3, score: 300});
            FinishLevelCommand.execute(this.state, {level: 4, score: 300});
            FinishLevelCommand.execute(this.state, {level: 5, score: 300});
            FinishLevelCommand.execute(this.state, {level: 6, score: 300});
            FinishLevelCommand.execute(this.state, {level: 7, score: 300});
            this.state.data.get('progress').should.be.equal(8);
            FinishLevelCommand.execute(this.state, {level: 8, score: 300});
            this.state.data.get('progress').should.be.equal(8);
        });

        it('finish level without stars', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 100});
            this.applyReward.should.be.calledWith({});
        });

        it('finish level with 1 star and without stars consistently', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 300});
            this.applyReward.should.be.calledWith({game_balance: 20, real_balance: 10});
            FinishLevelCommand.execute(this.state, {level: 1, score: 100});
            this.applyReward.should.be.calledWith({});
        });

        it('finish level with 1 star', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 300});
            this.applyReward.should.be.calledWith({game_balance: 20, real_balance: 10});
        });

        it('finish level with 2 stars', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 400});
            this.applyReward.should.be.calledWith({game_balance: 40, real_balance: 20});
        });

        it('finish level with 3 stars', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 500});
            this.applyReward.should.be.calledWith({game_balance: 60, real_balance: 30});
        });

        it('finish level with 1 star, 2 stars and 3 stars consistently', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 300});
            this.applyReward.should.be.calledWith({game_balance: 20, real_balance: 10});
            FinishLevelCommand.execute(this.state, {level: 1, score: 400});
            this.applyReward.should.be.calledWith({game_balance: 20, real_balance: 10});
            FinishLevelCommand.execute(this.state, {level: 1, score: 500});
            this.applyReward.should.be.calledWith({game_balance: 20, real_balance: 10});
        });

        it('chapter successfully added after finishing last level in chapter', function() {
            FinishLevelCommand.execute(this.state, {level: 1, score: 300});
            FinishLevelCommand.execute(this.state, {level: 2, score: 300});

            this.state.data.get('chapters').should.have.property('2');
            this.state.data.get('chapters.2').unlocked.should.be.false;
            this.state.data.get('chapters.2').unlocks.should.deep.equal([]);
        });

        it('throws if finishing level in undiscovered chapter', function() {
            var self = this;
            (function() {
                FinishLevelCommand.execute(self.state, {level: 3, score: 300});
            }).should.throw(AccessProtocolError);
        });

        it('throws if finishing level in locked chapter', function() {
            var self = this;
            FinishLevelCommand.execute(self.state, {level: 1, score: 300});
            FinishLevelCommand.execute(self.state, {level: 2, score: 300});
            (function() {
                FinishLevelCommand.execute(self.state, {level: 3, score: 300});
            }).should.throw(GameLogicError);
        });

        it('items successfully added in cafe after finishing level', function() {
            this.unlockItems = helper.sandbox.stub(this.state.cafe, 'unlockItems');

            FinishLevelCommand.execute(this.state, {level: 1, score: 300});
            FinishLevelCommand.execute(this.state, {level: 2, score: 300});
            this.state.data.set('chapters.2.unlocked', true);
            FinishLevelCommand.execute(this.state, {level: 3, score: 300});
            FinishLevelCommand.execute(this.state, {level: 4, score: 300});
            FinishLevelCommand.execute(this.state, {level: 5, score: 300});
            FinishLevelCommand.execute(this.state, {level: 6, score: 300});
            FinishLevelCommand.execute(this.state, {level: 7, score: 300});

            this.unlockItems.should.be.calledWith(this.state.cafe.unlockDef(7));
        });
    });
});
