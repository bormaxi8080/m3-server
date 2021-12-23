module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

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
            name: 'finish_level',
            params: {level: 10, score: 15000}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'unlock_chapter',
            params: {}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 20, score: 15000}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'buy_chapter_unlocks',
            params: {}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'unlock_chapter',
            params: {}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 21, score: 20000}
        }]
    });
};
