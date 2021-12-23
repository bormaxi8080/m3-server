var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var ClaimSharingRewardCommand = helper.require('game/commands/claimSharingRewardCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('ClaimSharingRewardCommand', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            progress: 1,
            sharing_count: 0,
            game_balance: 0,
            real_balance: 0,
            social_networks: {
                sharing_reward: {
                    real_balance: 1
                },
                FB: {}
            },
            events: []
        };

        var dataWrapper = DefManager.loadStaticDefs();
        dataWrapper.readonly = false;

        this.state = new State(this.userId, this.data, dataWrapper, DefManager.loadStaticCache());
    });

    describe(".validateParams", function() {
        it('always returns true', function() {
            ClaimSharingRewardCommand.validateParams().should.be.true;
            ClaimSharingRewardCommand.validateParams({}).should.be.true;
        });
    });

    describe(".execute", function() {
        beforeEach(function() {
            this.event = helper.sandbox.stub(Journal, "event");
            this.applyReward = helper.sandbox.stub(this.state.player, 'applyReward');
        });

        it("applyReward method called once", function() {
            ClaimSharingRewardCommand.execute(this.state, {});
            this.applyReward.should.be.calledOnce;
        });

        it("Sharing reward successfully cleared in state after reward claim", function() {
            ClaimSharingRewardCommand.execute(this.state, {});
            this.state.data.get('social_networks.sharing_reward').should.deep.equal({});
        });

        it("throws if twice claim", function() {
            var self = this;
            (function() {
                ClaimSharingRewardCommand.execute(self.state, {});
                ClaimSharingRewardCommand.execute(self.state, {});
            }).should.throw(GameLogicError);
        });
    });
});
