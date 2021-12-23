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
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'idkfa',
            params: {real_balance: 1000, game_balance: 1000}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'buy_booster_pack',
            params: {
                name: "unknown_pack"
            }
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'buy_booster_pack',
            params: {
                name: "gingerbread_man"
            }
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'buy_booster_pack',
            params: {
                name: "pastry_tongs"
            }
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 2, score: 10000}
        }, {
            name: 'finish_level',
            params: {level: 3, score: 15000}
        }, {
            name: 'finish_level',
            params: {level: 3, score: 20000}
        }, {
            name: 'finish_level',
            params: {level: 4, score: 20000}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'buy_booster_pack',
            params: {
                name: "pastry_tongs"
            }
        }]
    });
};
