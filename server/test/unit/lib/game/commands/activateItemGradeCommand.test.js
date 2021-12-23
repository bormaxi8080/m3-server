var helper = require('../../../helper.js');

var Journal = helper.require('journal.js');
var GameLogicError = helper.require('gameLogicError.js');

var ActivateItemGradeCommand = helper.require('game/commands/activateItemGradeCommand.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('ActivateItemGradeCommand', function() {
    describe('.validateParams', function() {
        it('returns true on valid params', function() {
            ActivateItemGradeCommand.validateParams({item: 'cafe_stall', grade: 1}).should.be.true;
        });

        it('returns false on invalid params', function() {
            ActivateItemGradeCommand.validateParams({item: 'cafe_stall', grade: -1}).should.be.false;
            ActivateItemGradeCommand.validateParams({item: 'cafe_stall', grade: 'other'}).should.be.false;
            ActivateItemGradeCommand.validateParams({item: 22, grade: 'other'}).should.be.false;
        });
    });

    describe('.execute', function() {

        beforeEach(function() {
            this.data = {
                cafe: {
                    items: {
                        cafe_stall: {
                            grades: [0, 1],
                            active: 0
                        }
                    }
                }
            };
            this.state = new State(1, this.data, DefManager.loadStaticDefs(), DefManager.loadStaticCache());
            this.event = helper.sandbox.stub(Journal, "event");
        });

        it('changes active grade', function() {
            ActivateItemGradeCommand.execute(this.state, {item: "cafe_stall", grade: 1});
            this.state.data.get("cafe.items.cafe_stall.active").should.equal(1);
        });

        it('throws when item is not unlocked in cafe', function() {
            var self = this;
            (function() {
                ActivateItemGradeCommand.execute(self.state, {item: "cafe_table", grade: 1});
            }).should.throw(GameLogicError);
        });

        it('throws when item grade is not unlocked in cafe', function() {
            var self = this;
            (function() {
                ActivateItemGradeCommand.execute(self.state, {item: "cafe_stall", grade: 99});
            }).should.throw(GameLogicError);
        });
    });
});
