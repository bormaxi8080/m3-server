var _ = require('lodash');

module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    });

    var session = server.getSession({
        client_network: facebookNetwork
    }).session;

    var facebookIds = [];
    var facebookSessions = [];

    for (var i = 0; i < 5; i++) {
        deviceNetwork = server.generateDeviceNetwork();
        facebookNetwork = server.generateFacebookNetwork();

        var facebookSession = server.getSession({
            client_network: deviceNetwork,
            auth_network: facebookNetwork
        }).session;

        facebookIds.push(facebookNetwork.network_id);
        facebookSessions.push(server.generateSessionHandler(facebookSession));
    }

    var users = server.usersQuery({
        session: session,
        credentials: {
            'FB': facebookIds
        }
    });

    var userIds = _.map(Object.keys(users.FB), function(facebookId) {
        return users.FB[facebookId];
    });

    server.commands({
        session: facebookSessions[0].session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 1000}
        }, {
            name: 'finish_level',
            params: {level: 2, score: 2000}
        }]
    });

    server.commands({
        session: facebookSessions[1].session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 2000}
        }, {
            name: 'finish_level',
            params: {level: 2, score: 3000}
        }]
    });

    server.commands({
        session: facebookSessions[2].session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 500}
        }]
    });

    server.commands({
        session: facebookSessions[3].session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 1500}
        }]
    });

    server.usersLevelsQuery({
        session: session,
        levels: [1, 2],
        users: userIds
    });
};
