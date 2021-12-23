module.exports = function(server, records) {

    var senderSession = server.getSession({
        client_network: server.generateDeviceNetwork()
    }).session;


    var countRecievers = 30;

    var commands = [];

    var receiverSession, receiverData, receiverId;

    for (var i = 0; i < countRecievers; ++i) {
        receiverSession = server.getSession({
            client_network: server.generateDeviceNetwork()
        }).session;
        receiverData = server.init({
            session: receiverSession
        });
        receiverId = receiverData.user_data.user_id;
        commands.push({
            name: 'send_message',
            params: {
                user_id: receiverId,
                code: 'gift',
                params: {
                    text: 'text-'+receiverId
                }
            }
        });
    }

    server.commands({
        session: senderSession,
        commands: commands
    });

    var receivedMessages = JSON.parse(server.postRequest('/messages/unread', {
        session: receiverSession
    }));

    server.commands({
        session: receiverSession,
        commands: [{
            name: 'read_message',
            params: {message_id: receivedMessages.messages[0].id}
        }]
    });
};
