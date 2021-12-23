module.exports = function(server, records) {
    var facebookNetwork = server.generateFacebookNetwork();

    server.postRequest("/facebook/fetch", {
        client_network: facebookNetwork
    });

    var session = server.getSession({
        client_network: facebookNetwork
    }).session;

    server.init({
        session_id: session
    });
};
