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
    for (var i = 0; i < 3; i++) {
        deviceNetwork = server.generateDeviceNetwork();
        facebookNetwork = server.generateFacebookNetwork();

        server.getSession({
            client_network: deviceNetwork,
            auth_network: facebookNetwork
        });

        facebookIds.push(facebookNetwork.network_id);
    }

    server.usersQuery({
        session: session,
        credentials: {
            'FB': facebookIds
        }
    });

    server.usersQuery({
        session: session,
        credentials: {
            'FB': []
        }
    });
};
