module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    var deviceSession = server.getSession({
        client_network: deviceNetwork
    }).session;

    var facebookSession = server.getSession({
        client_network: facebookNetwork
    }).session;

    server.commands({
        session: deviceSession,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 10000}
        }, {
            name: 'finish_level',
            params: {level: 2, score: 50000}
        }, {
            name: 'finish_level',
            params: {level: 3, score: 10000}
        }]
    });

    server.commands({
        session: facebookSession,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 50000}
        }, {
            name: 'finish_level',
            params: {level: 2, score: 10000}
        }]
    });

    server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    });
};
