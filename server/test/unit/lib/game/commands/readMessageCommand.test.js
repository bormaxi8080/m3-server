var _ = require('lodash');
var helper = require('../../../helper.js');

var GameLogicError = helper.require('gameLogicError.js');

var ReadMessageCommand = helper.require('game/commands/readMessageCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

var clone = require('node-v8-clone').clone;

describe('ReadMessageCommand', function() {
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
        it('when message_id is positve number then returns true', function() {
            ReadMessageCommand.validateParams({message_id: 1}).should.be.true;
        });
        it('when message_id is not positve number then returns false', function() {
            ReadMessageCommand.validateParams({message_id: 'qwe'}).should.be.false;
        });
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.messageId = 1;
            this.message = {
                id: this.messageId,
                from_user_id: 10,
                type: 'key'
            }
            this.state.messages.indexedMessages = {};
            this.state.messages.indexedMessages[this.messageId] = this.message;
        });

        it('when execute, message_id should be in readedMessages array', function() {
            ReadMessageCommand.execute(this.state, {message_id: this.messageId})
            this.state.messages.readedMessages.should.contain(this.messageId);
        });

        it('test message type "life"', function() {
            this.message.type = 'life';
            var addEvent = helper.sandbox.stub(this.state, 'addEvent');
            ReadMessageCommand.execute(this.state, {message_id: this.messageId})
            addEvent.should.be.calledWith('add_life', 1);
        });

        it('test message type "request_fuel"', function() {
            this.message.type = 'request_fuel';
            this.message.params = {chapter_id: 33}

            var addOutgoing = helper.sandbox.stub(this.state.messages, 'addOutgoing');
            ReadMessageCommand.execute(this.state, {message_id: this.messageId})
            addOutgoing.should.be.calledWith(this.message.from_user_id, 'fuel', {chapter_id: 33});
        });

        it('test message type "fuel"', function() {
            this.message.type = 'fuel';
            var getLockedChapter = helper.sandbox.stub(this.state.chapter, 'getLockedChapter');
            ReadMessageCommand.execute(this.state, {message_id: this.messageId})
            getLockedChapter.should.be.called;
        });
    });
});
