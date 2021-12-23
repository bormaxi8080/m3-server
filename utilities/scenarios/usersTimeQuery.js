var _ = require('lodash');

module.exports = function(server, records) {
    var facebookIds = [];

    for (var i = 0; i < 3; i++) {
        var deviceNetwork = server.generateDeviceNetwork();
        var facebookNetwork = server.generateFacebookNetwork();

        server.getSession({
            client_network: deviceNetwork,
            auth_network: facebookNetwork
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

    server.usersTimeQuery({
        session: session,
        users: userIds
    });
};
