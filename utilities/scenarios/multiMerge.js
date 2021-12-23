module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();
    var facebookNetwork2 = server.generateFacebookNetwork();

    var session = server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    }).session;

    server.getSession({
        client_network: facebookNetwork2
    });

    server.updateSession({
        session: session,
        auth_network: facebookNetwork2
    });

    server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork2
    });
};
