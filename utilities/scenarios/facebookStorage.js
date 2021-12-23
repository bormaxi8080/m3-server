module.exports = function(server, records) {
    var facebookNetwork = server.generateFacebookNetwork();

    var session = server.getSession({
        client_network: facebookNetwork
    }).session;

    server.postRequest("/facebook/store", {
        client_network: facebookNetwork,
        data: "AAAAA"
    });

    server.postRequest("/facebook/store", {
        client_network: facebookNetwork,
        data: "BBBB"
    });

    console.log(server.postRequest("/facebook/fetch", {
        client_network: facebookNetwork
    }));
};
