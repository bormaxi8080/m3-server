module.exports = function(server, records) {

    var user1 = server.generateUser({init: true, is_fb_user: true});
    var user2 = server.generateUser({init: true, is_fb_user: true});
    var network_ids = [
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000)),
        'BB'+(~~(Math.random() * 100000000))
    ];

    var q = user1.request('/invites/store', {network_code: 'FB', network_ids: network_ids, by_action: true});

    network_ids.forEach(function(nid) {
        var clientNetwork = server.generateNetwork('FB', nid);
        var newUser = server.generateUser({init: true, client_network: clientNetwork});
    });

    var unreadResult = user1.request('/messages/unread', {});
    user1.commands([{
        name: 'read_message',
        params: {
            message_id: unreadResult.messages[0].id
        }
    },{
        name: 'read_message',
        params: {
            message_id: unreadResult.messages[1].id
        }
    }]);

    user1.request('/invites/fetch', {network_code: 'FB'});
};
