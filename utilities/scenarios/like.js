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
            name: 'like',
            params: {
                network_code: "FB"
            }
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'like',
            params: {
                network_code: "FB"
            }
        }]
    });
};
