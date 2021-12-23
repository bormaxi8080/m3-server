module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 10000}
        }, {
            name: 'buy_item',
            params: {item: 'item_2'}
        }]
    });

    session = server.getSession({
        client_network: facebookNetwork
    }).session;

    server.commands({
        session: session,
        commands: [{
            name: 'finish_level',
            params: {level: 1, score: 10000}
        }, {
            name: 'buy_item',
            params: {item: 'item_5'}
        }]
    });

    session = server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    }).session;

    server.init({
        session: session
    });
};
