module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    server.getSession({
        client_network: facebookNetwork
    });

    server.updateSession({
        session: session,
        auth_network: facebookNetwork
    });
};
