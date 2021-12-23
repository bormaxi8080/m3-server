module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

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
            name: 'update_locked_chapter',
            params: {unlock_on: Date.now() + 60000}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'update_locked_chapter',
            params: {unlocked: true}
        }]
    });
};
