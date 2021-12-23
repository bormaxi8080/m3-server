var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var GameLogicError = helper.require('gameLogicError.js');

var IdkfaCommand = helper.require('game/commands/idkfaCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('IdkfaCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            game_balance: 0,
            real_balance: 0
        };
        this.state = new State(this.userId, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
    });

    describe('.validateParams', function() {
        it('always returns true', function() {
            IdkfaCommand.validateParams().should.be.true;
        });
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
            this.addGameBalance = helper.sandbox.stub(this.state.player, 'addGameBalance');
            this.addRealBalance = helper.sandbox.stub(this.state.player, 'addRealBalance');
        });

        it('increment game_balance & real_balance', function() {
            IdkfaCommand.execute(this.state, {game_balance: 1000, real_balance: 1000});
            this.addGameBalance.should.be.calledWith(1000);
            this.addRealBalance.should.be.calledWith(1000);
        });

        it('state not changed when passed empty params', function() {
            IdkfaCommand.execute(this.state, {});
            this.state.data.get('game_balance').should.equal(0);
            this.state.data.get('real_balance').should.equal(0);
        });

        it('throws if passed incorrect balance value', function() {
            var self = this;
            (function() {
                IdkfaCommand.execute(self.state, {game_balance: 'incorrect_value'});
            }).should.throw(GameLogicError);
        });

    });
});
