var _ = require('lodash');

module.exports = function(server, records) {
    var finishLevels = function(session, levels) {
        var levelsCount = levels.length;

        for (var i = 0; i < levelsCount; i++) {
            server.commands({
                session: session,
                commands: [
                    {
                        name: 'finish_level',
                        params: {level: levels[i].id, score: 10000}
                    }
                ]
            });
        }
    };

    var deviceNetwork = server.generateDeviceNetwork();

    var session = server.getSession({
        client_network: deviceNetwork
    }).session;

    // Finish unexisting bonus level
    server.commands({
        session: session,
        commands: [{
            name: 'finish_bonus_level',
            params: {
                level: 'bonus_1',
                score: 15000,
                rewards: [9, 33]
            }
        }]
    });

    // Finish bonus levels in unexisting chapter
    server.commands({
        session: session,
        commands: [{
            name: 'finish_bonus_level',
            params: {
                level: 'bonus_2',
                score: 15000,
                rewards: [0, 1, 2]
            }
        }]
    });

    var levels = JSON.parse(server.getRequest("/defs", {})).mapscreen.chapters[0].levels;

    finishLevels(session, levels);

    // Finish bonus levels in locked chapter
    server.commands({
        session: session,
        commands: [{
            name: 'finish_bonus_level',
            params: {
                level: 'bonus_2',
                score: 15000,
                rewards: [0, 1, 2]
            }
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
            name: 'finish_bonus_level',
            params: {
                level: 'bonus_2',
                score: 15000,
                rewards: [0, 1, 2]
            }
        }]
    });
};
