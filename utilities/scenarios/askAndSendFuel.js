module.exports = function(server, records) {

    var askerSession = server.getSession({
        client_network: server.generateDeviceNetwork()
    }).session;

    server.commands({
        session: askerSession,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 10000}
        }, {
            name: 'finish_level',
            params: {level: 2, score: 15000}
        }]
    });

    for (var i = 0; i < 3; ++i) {
        var senderSession = server.getSession({
            client_network: server.generateDeviceNetwork()
        }).session;
        var senderData = server.init({
            session: senderSession
        });
        var senderId = senderData.user_data.id;

        server.commands({
            session: askerSession,
            commands: [{
                name: 'send_message',
                params: {
                    user_id: senderId,
                    code: 'ask_for_fuel',
                    params: {}
                }
            }]
        });
        var senderMessages = JSON.parse(server.postRequest('/messages/unread', {
            session: senderSession
        }));

        server.commands({
            session: senderSession,
            commands: [{
                name: 'read_message',
                params: {message_id: senderMessages.messages[0].id}
            }]
        });

        var askerMessages = JSON.parse(server.postRequest('/messages/unread', {
            session: askerSession
        }));

        server.commands({
            session: askerSession,
            commands: [{
                name: 'read_message',
                params: {message_id: askerMessages.messages[0].id}
            }]
        });
    }
};
