module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    });

    var session = server.getSession({
        client_network: facebookNetwork
    }).session;

    var facebookIds = [
        "892605340766761",
        "10152622606734189",
        "4319246876664",
        "914918858524826",
        "339324149563357",
        "1472669693006965"
    ];

    server.usersQuery({
        session: session,
        credentials: {
            'FB': facebookIds
        }
    });
};
