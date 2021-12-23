module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    // Some commands are force incorrect
    server.commands({
        session: session,
        commands: [{
            id: 1,
            name: 'finish_level',
            params: {
                level: 1,
                score: 10000
            }
        }, {
            id: 2,
            name: 'finish_level',
            params: {
                level: 2,
                score: 15000,
                used_boosters: {
                    reverse_move: 2
                }
            }
        }, {
            id: 3,
            name: 'finish_level',
            params: {
                level: 3,
                score: 15000,
                used_boosters: {
                    other_booster: 1
                }
            }
        }]
    });
};
