var helper = require('../../helper');
var server = require('../../lib/server').byId('local');
var User = require('../../lib/user');

describe('Gamecenter authentication', function() {

    it('returns session ID', function() {
        var user = new User(server);
        var response = server.getSession({
            client_network: server.generateDeviceNetwork(),
            auth_network: server.generateNetwork('GC', 'G:123')
        });
        response.should.not.have.property('error');
        response.should.have.property('session');
    });
});
