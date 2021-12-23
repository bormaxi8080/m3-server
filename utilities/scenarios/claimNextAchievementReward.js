module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    server.commands({
        session: session,
        commands: [{
            name: 'add_achievement',
            params: {achievement: 'collect_blue_cakes', level: "gold"}
        }]
    });

    // bronze
    server.commands({
        session: session,
        commands: [{
            name: 'claim_next_achievement_reward',
            params: {achievement: 'collect_blue_cakes'}
        }]
    });
    // silver
    server.commands({
        session: session,
        commands: [{
            name: 'claim_next_achievement_reward',
            params: {achievement: 'collect_blue_cakes'}
        }]
    });
    // gold
    server.commands({
        session: session,
        commands: [{
            name: 'claim_next_achievement_reward',
            params: {achievement: 'collect_blue_cakes'}
        }]
    });
    // command will be rejected (throws error)
    server.commands({
        session: session,
        commands: [{
            name: 'claim_next_achievement_reward',
            params: {achievement: 'collect_blue_cakes'}
        }]
    });
};
