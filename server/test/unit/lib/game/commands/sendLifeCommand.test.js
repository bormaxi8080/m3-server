var _ = require('lodash');
var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var GameLogicError = helper.require('gameLogicError.js');

var SendLifeCommand = helper.require('game/commands/sendLifeCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('SendLifeCommand', function() {
    beforeEach(function() {
        this.toUserId = 1000;
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            game_balance: 0,
            real_balance: 0
        };
        this.state = new State(this.userId, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
    });

    describe('.validateParams', function() {
        it('returns true on valid params', function() {
            SendLifeCommand.validateParams({user_id: this.toUserId}).should.be.true;
        });

        it('returns false on invalid params', function() {
            SendLifeCommand.validateParams().should.be.false;
            SendLifeCommand.validateParams({}).should.be.false;
            SendLifeCommand.validateParams({user_id: '100'}).should.be.false;
        });
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
        });

        it('last send timestamp should be in state', function() {
            SendLifeCommand.execute(this.state, {user_id: this.toUserId});
            var stateKey = 'messages.last_send_to.life.' + this.toUserId;
            this.state.data.getOrDefault(stateKey, 0).should.be.above(Date.now() - 1000);
        });

        it('throws on send life when period is not finished', function() {
            SendLifeCommand.execute(this.state, {user_id: this.toUserId});
            var self = this;
            (function() {
                SendLifeCommand.execute(self.state, {user_id: self.toUserId});
            }).should.throw(GameLogicError);
        });
    });

});
