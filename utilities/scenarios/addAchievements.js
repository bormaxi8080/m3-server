module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    server.commands({
        session: session,
        commands: [{
            name: 'add_achievement',
            params: {achievement: 'collect_blue_cakes', level: "bronze"}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'add_achievement',
            params: {achievement: 'collect_blue_cakes', level: "platinum"}
        }, {
            name: 'add_achievement',
            params: {achievement: 'collect_blue_cakes', level: "bronze"}
        }]
    });

    server.commands({
        session: session,
        commands: [{
            name: 'add_achievement',
            params: {achievement: 'collect_blue_cakes', level: "silver"}
        }, {
            name: 'add_achievement',
            params: {achievement: 'collect_blue_cakes', level: "diamond"}
        }]
    });
};
