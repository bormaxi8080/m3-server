module.exports = function(server, records) {

    var senderUser = server.generateUser({init: true});
    var senderUser2 = server.generateUser({init: true});
    var recieverUser = server.generateUser({init: true});

    var sendResult = senderUser.commands([{
        name: 'send_life',
        params: {
            user_id: recieverUser.id
        }
    }]);

    var sendResult2 = senderUser2.commands([{
        name: 'send_life',
        params: {
            user_id: recieverUser.id
        }
    }]);

    var unreadResult = recieverUser.request('/messages/unread', {});

    var q = recieverUser.commands([{
        name: 'read_message',
        params: {
            message_id: unreadResult.messages[0].id
        }
    }, {
        name: 'read_message',
        params: {
            message_id: unreadResult.messages[1].id
        }
    }]);

    console.log(q);
};
