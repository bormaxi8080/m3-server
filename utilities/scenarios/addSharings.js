module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    var session = server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    }).session;

    server.commands({
        session: session,
        commands: [{
            name: 'add_sharing',
            params: {
                activity: "some_activity",
                network_code: "FB",
                sharing_id: "1111111_1234567890"
            }
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'add_sharing',
            params: {
                activity: "some_activity",
                network_code: "FB",
                sharing_id: "1111111_1234567890"
            }
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'claim_sharing_reward',
            params: {
                network_code: "FB"
            }
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'add_sharing',
            params: {
                activity: "some_activity",
                network_code: "GC",
                sharing_id: "1111111_2222222222"
            }
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'add_sharing',
            params: {
                activity: "some_activity",
                network_code: "FB",
                sharing_id: "1111111_99999999999"
            }
        }]
    });
};
