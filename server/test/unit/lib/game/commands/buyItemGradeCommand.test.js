var helper = require('../../../helper.js');

var GameLogicError = helper.require('gameLogicError.js');
var Journal = helper.require('journal.js');

var BuyItemGradeCommand = helper.require('game/commands/buyItemGradeCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('BuyItemGradeCommand', function() {
    describe('.validateParams', function() {
        it('returns true on valid params', function() {
            BuyItemGradeCommand.validateParams({item: 'cafe_stall', grade: 1}).should.be.true;
        });

        it('returns false on invalid params', function() {
            BuyItemGradeCommand.validateParams({item: 'cafe_stall', grade: 0}).should.be.false;
            BuyItemGradeCommand.validateParams({item: 'cafe_stall', grade: 'other'}).should.be.false;
            BuyItemGradeCommand.validateParams({item: 22, grade: 'other'}).should.be.false;
        });
    });

    describe('.execute', function() {
        beforeEach(function() {
            this.data = {
                cafe: {
                    items: {
                        cafe_stall: {
                            grades: [0],
                            active: 0
                        }
                    }
                },
                game_balance: 1000
            };
            this.state = new State(1, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
            this.event = helper.sandbox.stub(Journal, "event");
        });

        it('reduces balance by grade price', function() {
            this.reduceBalance = helper.sandbox.stub(this.state.player, 'reduceBalance');
            BuyItemGradeCommand.execute(this.state, {item: "cafe_stall", grade: 1});
            this.reduceBalance.should.be.calledWith({game_balance: 300});
        });

        it('adds bought grade to grade list', function() {
            BuyItemGradeCommand.execute(this.state, {item: "cafe_stall", grade: 1});
            this.state.data.get("cafe.items.cafe_stall.grades").should.deep.equal([0, 1]);
        });

        it('throws when item is not unlocked in cafe', function() {
            var self = this;
            (function() {
                BuyItemGradeCommand.execute(self.state, {item: "cafe_table", grade: 1});
            }).should.throw(GameLogicError);
        });

        it('throws when item grade is not defined', function() {
            var self = this;
            (function() {
                BuyItemGradeCommand.execute(self.state, {item: "cafe_stall", grade: 99});
            }).should.throw(GameLogicError);
        });

        it('throws when item grade already present in state', function() {
            var self = this;
            (function() {
                BuyItemGradeCommand.execute(self.state, {item: "cafe_stall", grade: 1});
                BuyItemGradeCommand.execute(self.state, {item: "cafe_stall", grade: 1});
            }).should.throw(GameLogicError);
        });
    });
});
