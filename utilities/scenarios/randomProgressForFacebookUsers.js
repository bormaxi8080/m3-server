var _ = require('lodash');

module.exports = function(server, records) {
    var facebookIds = [
        1468278016785599,
        1515323662044781,
        1532834406951589,
        330116163836195,
        1522191094667416,
        100005659396706,
        100007167736603,
        100004699849370,
        244858915709897,
        334006743422390
    ];

    var processUsers = function(facebookIds, levels) {
        for (var i = 0; i < facebookIds.length; i++) {
            var facebookNetwork = server.generateNetwork('FB', facebookIds[i]);

            var session = server.getSession({
                client_network: facebookNetwork
            }).session;

            server.reset({
                session: session
            });

            finishLevels(session, levels);
        }
    };

    var finishLevels = function(session, levels) {
        var levelsCount = _.random(1, levels.length);
        for (var i = 0; i < levelsCount; i++) {
            server.commands({
                session: session,
                commands: [
                    {
                        name: 'finish_level',
                        params: {level: levels[i].id, score: _.random(100, 10000)}
                    }
                ]
            });
        }
    };

    var usersLevelsQuery = function(session, levels, userIds) {
        server.usersLevelsQuery({
            session: session,
            levels: _.pluck(levels, "id"),
            users: userIds
        });
    };

    var levels = JSON.parse(server.getRequest("/defs", {})).mapscreen.chapters[0].levels;

    processUsers(facebookIds, levels);

    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    });

    var session = server.getSession({
        client_network: facebookNetwork
    }).session;

    var users = server.usersQuery({
        session: session,
        credentials: {
            'FB': facebookIds
        }
    });

    if (users.FB) {
        var userIds = _.map(Object.keys(users.FB), function(facebookId) {
            return users.FB[facebookId];
        });
        usersLevelsQuery(session, levels, userIds);
    }
};
