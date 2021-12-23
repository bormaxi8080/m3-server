var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var LikeCommand = helper.require('game/commands/likeCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('LikeCommand', function() {
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
            LikeCommand.validateParams({network_code: "FB"}).should.be.true;
        });

        it('returns false on invalid params', function() {
            LikeCommand.validateParams().should.be.false;
            LikeCommand.validateParams({}).should.be.false;
        });
    });

    describe(".execute", function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
            this.applyReward = helper.sandbox.stub(this.state.player, 'applyReward');
        });

        it("throws if like in unknown social network", function() {
            var self = this;
            (function() {
                LikeCommand.execute(self.state, {network_code: "unknown_network"});
            }).should.throw(GameLogicError);
        });

        it("like successfully added in state", function() {
            LikeCommand.execute(this.state, {network_code: "FB"});
            this.state.data.get("social_networks.FB.like").should.be.true;
        });

        it("applyReward method called with required aruments", function() {
            LikeCommand.execute(this.state, {network_code: "FB"});
            this.applyReward.should.be.calledOnce;
        });

        it("applyReward called once if like repeatedly", function() {
            LikeCommand.execute(this.state, {network_code: "FB"});
            LikeCommand.execute(this.state, {network_code: "FB"});
            this.applyReward.should.be.calledOnce;
        });
    });
});
