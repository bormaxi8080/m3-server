var helper = require('../helper');
var server = require('../lib/server').byId('local');

describe('test invalid command', function() {
    it('test', function() {
        var user = server.generateUser({init: true});
        var commandResult = user.commands([{
            name: 'invalid',
            params : {}
        }]);
        commandResult.should.have.property('rejected_commands');
        commandResult.should.have.property('user_data');
        commandResult.should.have.property('defs_hash');
        commandResult.should.have.property('server');
        commandResult.server.should.have.property('time');
    });
});
