module.exports = function(server, records) {
    server.getSession({
        client_network: server.generateDeviceNetwork()
    });
};
