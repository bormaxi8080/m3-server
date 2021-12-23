module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    server.levelsQuery({
        session: session
    });

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 500}
        }, {
            name: 'finish_level',
            params: {level: 1, score: 1100}
        }, {
            name: 'finish_level',
            params: {level: 1, score: 2200}
        }, {
            name: 'finish_level',
            params: {level: 1, score: 3500}
        }, {
            name: 'finish_level',
            params: {level: 2, score: 15000}
        }, {
            name: 'finish_level',
            params: {level: 3, score: 20000}
        }]
    });

    server.levelsQuery({
        session: session,
        levels: [1, 2, 3]
    });
};
