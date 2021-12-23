module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    server.init({
        session: session
    });
};
