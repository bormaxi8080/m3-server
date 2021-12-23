var helper = require('../helper');
var server = require('../lib/server').byId('local');

describe('invite users to our game', function() {
    before(function() {
        this.inviterNetwork = server.generateFacebookNetwork();
        this.inviterUser = server.generateUser({init: true, client_network: this.inviterNetwork});
        this.networkCode = 'FB';
        this.networkId = 'FB' + (~~(Math.random() * 100000000));
    });

    it('store invite', function() {
        var storeResult = this.inviterUser.request('/invites/store', {network_code: this.networkCode, network_ids: [this.networkId]});
        storeResult.should.be.an.Array;
        storeResult.length.should.equal(1);
    });

    it('accept invite', function() {
        var clientNetwork = server.generateNetwork(this.networkCode, this.networkId);
        var newUser = server.generateUser({init: true, client_network: clientNetwork});

        var fetchResult = this.inviterUser.request('/invites/fetch', {network_code: this.networkCode});
        fetchResult.should.be.an.Array;
        fetchResult.length.should.equal(1);

        var fetch = fetchResult[0];
        fetch.should.have.property('network_id', this.networkId);
        fetch.should.have.property('is_invited', true);
    });

    it('inviter should have message', function() {
        var messResult = this.inviterUser.request('/messages/unread', {});
        messResult.should.have.property('messages');
        messResult.messages.should.be.an.Array;
        messResult.messages.length.should.equal(1);
        messResult.messages[0].should.have.property('type', 'invite_reward');
    });
});
