module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    // All commands are correct
    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 15000}
        }, {
            name: 'finish_level',
            params: {level: 2, score: 15000}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 10000}
        }]
    });

    // Some commands are force incorrect
    server.commands({
        session: session,
        commands: [
        {
            name: 'finish_level',
            params: {level: 2, score: 20000}
        }, {
            name: 'finish_level',
            params: {level: 3, score: 17000}
        }, {
            name: 'finish_level',
            params: {level: 3, score: "17000"}
        }, {
            name: 'finish_level',
            params: {level: 'incorrect level', score: 22000}
        }, {
            params: {level: 2, score: 10000}
        }, {
            name: 'finish_level',
            params: {level: 2}
        }, {
            name: 'finish_level'
        }, {
            name: 'finish_level',
            params: {score: 10000}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 30, score: 300000}
        }]
    });
};
