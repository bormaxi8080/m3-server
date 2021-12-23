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
            name: 'buy_item',
            params: {item: 'item_1'}
        }]
    });

    // throws because this item is not for sale
    server.commands({
        session: session,
        commands: [{
            name: 'buy_item',
            params: {item: 'item_4'}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'buy_item',
            params: {item: 'item_5'}
        }, {
            name: 'buy_item',
            params: {item: 'item_2'}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'activate_item',
            params: {item: 'item_1'}
        }]
    });
};
