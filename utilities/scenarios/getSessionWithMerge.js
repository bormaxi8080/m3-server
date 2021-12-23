module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    server.getSession({
        client_network: deviceNetwork
    });

    server.getSession({
        client_network: facebookNetwork
    });

    server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    });
};
