var helper = require('../helper');
var _ = require('lodash');

describe('request and send fuel', function() {
    before(function() {
        this.chaptersData = helper.require('../import/map').chapters;
        this.server = require('../lib/server').byId('local');

        this.requesterUser = this.server.generateUser();
        this.senderUser = this.server.generateUser();

        this.requesterUser.init();
        this.senderUser.init();
    });

    it('must me error when no unlocked chapter', function() {
        var r = this.requesterUser.commands([{
            name: 'request_fuel',
            params: {
                user_id: this.senderUser.id,
            }
        }]);
        r.should.have.property('rejected_commands');
        r.rejected_commands.should.have.length(1);
    });

    it('chapter should be locked', function() {
        var levelId = 1;

        var generateFinishLevels = function(levels) {
            return levels.map(function(level) {
                return {
                    name: 'finish_level',
                    params: {
                        level: levelId++,
                        score: _.max(level.scores)
                    }
                };
            });
        };

        var commandsResult = this.requesterUser.commands(generateFinishLevels(this.chaptersData[0].levels));
        this.requesterUser.commands([{
                    name: 'unlock_chapter',
                    params: {}
                }]);
        commandsResult = this.requesterUser.commands(generateFinishLevels(this.chaptersData[1].levels));

        commandsResult.user_data.chapters.should.be.an.Object;
        commandsResult.user_data.chapters.should.have.property('3');
        commandsResult.user_data.chapters['3'].unlocked.should.be.false;
    });

    it('message with request should be in sender inbox', function() {
        this.requesterUser.commands([{
            name: 'request_fuel',
            params: {
                user_id: this.senderUser.id,
            }
        }]);

        var unreadResult = this.senderUser.request('/messages/unread', {});
        unreadResult.should.have.property('messages');
        unreadResult.messages.should.be.an.Array;
        unreadResult.messages.should.have.length(1);

        var mess = unreadResult.messages[0];
        mess.should.have.property('user_id', this.senderUser.id);
        mess.should.have.property('from_user_id', this.requesterUser.id);
        mess.should.have.property('type', 'request_fuel');
        this.requestMessageId = mess.id;
    });

    it('message with fuel should be in requester inbox', function() {
        this.senderUser.commands([{
            name: 'read_message',
            params: {
                message_id: this.requestMessageId,
            }
        }]);

        var unreadResult = this.requesterUser.request('/messages/unread', {});
        unreadResult.should.have.property('messages');
        unreadResult.messages.should.be.an.Array;
        unreadResult.messages.should.have.length(1);

        var mess = unreadResult.messages[0];
        mess.should.have.property('user_id', this.requesterUser.id);
        mess.should.have.property('from_user_id', this.senderUser.id);
        mess.should.have.property('type', 'fuel');
        var sendMessageId = mess.id;

        var readMessResult = this.requesterUser.commands([{
            name: 'read_message',
            params: {
                message_id: mess.id,
            }
        }]);
        readMessResult.user_data.chapters[3].unlocks.should.to.include(this.senderUser.id);
    });
});
