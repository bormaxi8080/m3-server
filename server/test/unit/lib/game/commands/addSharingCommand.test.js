var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var AddSharingCommand = helper.require('game/commands/addSharingCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('AddSharingCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            progress: 1,
            sharing_count: 0,
            game_balance: 0,
            real_balance: 0,
            social_networks: {
                FB: {}
            },
            events: []
        };

        var dataWrapper = DefManager.loadStaticDefs();
        dataWrapper.readonly = false;

        this.state = new State(this.userId, this.data, dataWrapper, DefManager.loadStaticCache());
    });

    describe(".validateParams", function() {
        it('returns true on valid params', function() {
            AddSharingCommand.validateParams({activity: "some_activity", network_code: "FB", sharing_id: "1111111_1234567890"}).should.be.true;
        });

        it('returns false on invalid params', function() {
            AddSharingCommand.validateParams().should.be.false;
            AddSharingCommand.validateParams({}).should.be.false;
        });
    });

    describe(".execute", function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
        });

        it("throws if sharing in unknown social network", function() {
            var self = this;
            (function() {
                AddSharingCommand.execute(self.state, {activity: "some_activity", network_code: "unknown_network_code", sharing_id: "1234567890"});
            }).should.throw(GameLogicError);
        });

        it("throws if Facebook sharing_id is incorrect", function() {
            var self = this;
            (function() {
                AddSharingCommand.execute(self.state, {activity: "some_activity", network_code: "FB", sharing_id: "1234567890"});
            }).should.throw(AccessProtocolError);
        });

        it("sharing successfully added in state", function() {
            AddSharingCommand.execute(this.state, {activity: "some_activity", network_code: "FB", sharing_id: "1111111_1234567890"});
            this.state.data.get("social_networks.FB.last_sharing_id").should.be.equal("1111111_1234567890");
            this.state.data.get("social_networks.sharing_reward").should.deep.equal({real_balance: 1});
        });

        it("sharing_count parameter in state successfully incremented if sharing", function() {
            AddSharingCommand.execute(this.state, {activity: "some_activity", network_code: "FB", sharing_id: "1111111_1234567890"});
            this.state.data.get('sharing_count').should.be.equal(1);
        });

        it("throws if Facebook sharing_id is rotten", function() {
            var self = this;
            (function() {
                AddSharingCommand.execute(self.state, {activity: "some_activity", network_code: "FB", sharing_id: "1111111_1234567890"});
                AddSharingCommand.execute(self.state, {activity: "some_activity", network_code: "FB", sharing_id: "1111111_1234567890"});
            }).should.throw(AccessProtocolError);
        });
    });
});
