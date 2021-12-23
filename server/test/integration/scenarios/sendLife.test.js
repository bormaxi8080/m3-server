var helper = require('../helper');
var server = require('../lib/server').byId('local');

describe('send life to another user', function() {
    before(function() {
        this.senderUser = server.generateUser({init: true});
        this.recieverUser = server.generateUser({init: true});
    });

    it('should be last_send_to', function() {
        var sendResult = this.senderUser.commands([{
            name: 'send_life',
            params: {
                user_id: this.recieverUser.id
            }
        }]);
        sendResult.user_data.should.have.property('messages');
        sendResult.user_data.messages.should.have.property('last_send_to');
        sendResult.user_data.messages.last_send_to.life.should.have.property(this.recieverUser.id);
    });

    it('result should have error when send second life', function() {
        var sendResult2 = this.senderUser.commands([{
            name: 'send_life',
            params: {
                user_id: this.recieverUser.id
            }
        }]);

        sendResult2.should.have.property('rejected_commands');
        sendResult2.rejected_commands.should.have.length(1);
    });

    it('message with life should be in reciever inbox', function() {
        this.unreadResult = this.recieverUser.request('/messages/unread', {});
        this.unreadResult.should.have.property('messages');
        this.unreadResult.messages.should.be.an.Array;
        this.unreadResult.messages.should.have.length(1);
    });

    it('when message is readed, result should have "add_life" event', function() {
        var r = this.recieverUser.commands([{
            name: 'read_message',
            params: {
                message_id: this.unreadResult.messages[0].id
            }
        }]);
        r.should.have.property('events');
        r.events.should.be.an.Array;
        r.events.length.should.be.above(0);
        r.events[0].should.have.property('add_life');
    });
});
