var helper = require('../helper');
var server = require('../lib/server').byId('local');

describe('buy life:', function() {
    before(function() {
        this.user = server.generateUser({init: true});
        this.price = this.user.defs().life.price;
    });

    it('user can\'t buy life without balance', function() {
        var buyResult = this.user.commands([{
            name: 'buy_life',
            params: {}
        }]);
        buyResult.rejected_commands.should.be.an.Array;
        buyResult.rejected_commands.should.be.above(0);
    });

    it('user can use hack for get balance', function() {
        var buyResult = this.user.commands([{
            name: 'idkfa',
            params: this.price
        }]);

        if (this.price.real_balance) {
            buyResult.user_data.real_balance.should.be.equal(this.price.real_balance);
        }
        if (this.price.game_balance) {
            buyResult.user_data.game_balance.should.be.equal(this.price.game_balance);
        }
    });

    it('user can buy life when have balance', function() {
        var buyResult = this.user.commands([{
            name: 'buy_life',
            params: {}
        }]);
        buyResult.should.have.property('events');
        buyResult.events.should.be.an.Array;
        buyResult.events.length.should.be.above(0);
        buyResult.events[0].should.have.property('add_life');
        buyResult.user_data.real_balance.should.be.below(this.price.real_balance);
    });
});
