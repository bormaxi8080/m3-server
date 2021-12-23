module.exports = function(server, records, program) {
    var senderUser = server.generateUser({init: true});
    var recieverId = parseInt(program.uid);

    var sendResult = senderUser.commands([{
        name: 'send_life',
        params: {
            user_id: recieverId
        }
    }]);

    var sendResult = senderUser.commands([{
        name: 'request_life',
        params: {
            user_id: recieverId
        }
    }]);

};
