module.exports = function(server, records) {
    var sessionId = server.getSession({
        client_network: server.generateDeviceNetwork()
    }).session;

    var userData = server.init({
        session: sessionId
    });

    server.commands({
        session: sessionId,
        commands: [{
            name: 'buy_life',
            params: {}
        }]
    });

    server.commands({
        session: sessionId,
        commands: [{
            name: 'idkfa',
            params: {real_balance: 1000, game_balance: 1000}
        }]
    });

    server.commands({
        session: sessionId,
        commands: [{
            name: 'buy_life',
            params: {}
        }]
    });
};
