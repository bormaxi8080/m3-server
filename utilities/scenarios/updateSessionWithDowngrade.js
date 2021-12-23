module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    var session = server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    }).session;

    server.updateSession({
        session: session
    });
};
