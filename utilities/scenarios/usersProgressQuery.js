var _ = require('lodash');

module.exports = function(server, records) {
    var facebookIds = [];

    for (var i = 0; i < 3; i++) {
        var deviceNetwork = server.generateDeviceNetwork();
        var facebookNetwork = server.generateFacebookNetwork();

        var handler = server.generateSessionHandler(server.getSession({
            client_network: deviceNetwork,
            auth_network: facebookNetwork
        }).session);

        server.commands({
            session: handler.session,
            commands: [{
                id: handler.nextCommandId(),
                name: 'finish_level',
                params: {level: 1, score: 10000}
            }, {
                id: handler.nextCommandId(),
                name: 'finish_level',
                params: {level: 2, score: 15000}
            }]
        });

        facebookIds.push(facebookNetwork.network_id);
    }

    var session = server.getSession({
        client_network: server.generateFacebookNetwork()
    }).session;

    var users = server.usersQuery({
        session: session,
        credentials: {
            'FB': facebookIds
        }
    });

    var userIds = _.map(Object.keys(users.FB), function(facebookId) {
        return users.FB[facebookId];
    });

    server.usersProgressQuery({
        session: session,
        users: userIds
    });

    server.usersProgressQuery({
        session: session,
        users: []
    });
};
