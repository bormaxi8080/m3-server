module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 10000}
        }, {
            name: 'finish_level',
            params: {level: 2, score: 15000}
        }]
    });

    server.reset({
        session: session
    });
};
