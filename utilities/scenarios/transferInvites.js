module.exports = function(server, records) {
    var deviceNetwork = server.generateDeviceNetwork();
    var facebookNetwork = server.generateFacebookNetwork();

    var fromUser = server.generateUser({init: true, client_network: deviceNetwork});

    var network_ids = [
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000))
    ];

    var q = fromUser.request('/invites/store', {network_code: 'FB', network_ids: network_ids});
    network_ids.forEach(function(nid) {
        var clientNetwork = server.generateNetwork('FB', nid);
        var newUser = server.generateUser({init: true, client_network: clientNetwork});
    });

    network_ids.pop();
    network_ids.pop();
    network_ids.pop();
    network_ids.pop();
    network_ids.pop();

    network_ids.push(
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000))
    );

    var toUser = server.generateUser({init: true, client_network: facebookNetwork});
    q = toUser.request('/invites/store', {network_code: 'FB', network_ids: network_ids});

    server.getSession({
        client_network: deviceNetwork,
        auth_network: facebookNetwork
    });
};
