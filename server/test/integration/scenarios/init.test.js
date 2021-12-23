var helper = require('../helper');
var server = require('../lib/server').byId('local');

describe('test init', function() {
    it('should be user_data', function() {
        var user = server.generateUser();
        var data = user.init();
        data.should.have.property('user_data');
        data.should.have.property('defs_hash');
        data.should.have.property('server');
    });
});
