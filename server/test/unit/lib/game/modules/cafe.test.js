var helper = require('../../../helper');

var AccessProtocolError = helper.require('accessProtocolError.js');
var GameLogicError = helper.require('gameLogicError.js');

var Cafe = helper.require('game/modules/cafe.js');

var DefManager = helper.require('defs/defManager.js');
var State = helper.require('game/state.js');

describe('Cafe', function() {
    beforeEach(function() {
        this.userId = 1;
        this.data = {
            user_id: this.userId,
            game_balance: 0,
            real_balance: 0,
            cafe: {
                items: {
                    cafe_stall: {
                        grades: [0, 1],
                        active: 0
                    }
                }
            }
        };
        this.state = new State(this.userId, this.data, DefManager.loadStaticDefs());
    });

    describe('#itemTypeByItem', function() {
        it('returns correct item type for existing item def', function() {
            this.state.cafe.itemTypeByItem("cafe_table_1").should.deep.equal(
                this.state.defs.raw.cafe.types.cafe_table
            );
        });

        it('throws for unknown item def', function() {
            var self = this;
            (function() {
                self.state.cafe.itemTypeByItem("unknown_item");
            }).should.throw(AccessProtocolError);
        });
    });

    describe('#itemGrades', function() {
        it('returns correct item grades for existing item def', function() {
            this.state.cafe.itemGrades("cafe_table_1").should.deep.equal(
                this.state.defs.raw.cafe.types.cafe_table.grades
            );
        });

        it('throws for unknown item def', function() {
            var self = this;
            (function() {
                self.state.cafe.itemGrades("unknown_item");
            }).should.throw(AccessProtocolError);
        });
    });

    describe('#itemStateGradesProp', function() {
        it('returns correct item grades property name', function() {
            this.state.cafe.itemStateGradesProp("cafe_table_1").should.deep.equal("cafe.items.cafe_table_1.grades");
        });
    });

    describe('#itemStateGrades', function() {
        it('returns correct item grades for exisiting item in state', function() {
            this.state.cafe.itemStateGrades("cafe_stall").should.deep.equal([0, 1]);
        });

        it('throws for unexisting item in state', function() {
            var self = this;
            (function() {
                self.state.cafe.itemStateGrades("cafe_table_1");
            }).should.throw(AccessProtocolError);
        });

        it('throws for unknown item def', function() {
            var self = this;
            (function() {
                self.state.cafe.itemStateGrades("unknown_item");
            }).should.throw(AccessProtocolError);
        });
    });

    describe('#itemStateActiveGradeProp', function() {
        it('returns correct active grade property name', function() {
            this.state.cafe.itemStateActiveGradeProp("cafe_stall").should.be.equal("cafe.items.cafe_stall.active");
        });
    });

    describe('#itemStateActiveGrade', function() {
        it('returns correct active grade for existing item in state', function() {
            this.state.cafe.itemStateActiveGrade("cafe_stall").should.be.equal(0);
        });

        it('throws for unexisting item in state', function() {
            var self = this;
            (function() {
                self.state.cafe.itemStateActiveGrade("cafe_table_1");
            }).should.throw(AccessProtocolError);
        });

        it('throws for unknown item def', function() {
            var self = this;
            (function() {
                self.state.cafe.itemStateActiveGrade("unknown_item");
            }).should.throw(AccessProtocolError);
        });
    });

    describe('#unlockDef', function() {
        it('returns correct unlock defs for levels', function() {
            this.state.cafe.unlockDef(1).should.deep.equal([]);
            this.state.cafe.unlockDef(7).should.deep.equal([ 'cafe_stall', 'cafe_table_1' ]);
        });
    });

    describe('#unlockItem', function() {
        it('correctly adds new item in state', function() {
            this.state.cafe.unlockItem("cafe_table_1");
            this.state.data.get('cafe').should.deep.equal({
                items: {
                    cafe_stall: {
                        grades: [0, 1],
                        active: 0
                    },
                    cafe_table_1: {
                        grades: [0],
                        active: 0
                    }
                }
            });
        });

        it('throws for already existing item in state', function() {
            var self = this;
            (function() {
                self.state.cafe.unlockItem("cafe_stall");
            }).should.throw(GameLogicError);
        });

        it('throws for unknown item def', function() {
            var self = this;
            (function() {
                self.state.cafe.unlockItem("unknown_item");
            }).should.throw(GameLogicError);
        });
    });

    describe('#unlockItems', function() {
        it('correctly calls unlockItem for all items', function() {
            this.unlockItem = helper.sandbox.stub(this.state.cafe, 'unlockItem');
            this.state.cafe.unlockItems(["cafe_stall", "cafe_table_1"]);
            this.unlockItem.should.be.calledWith("cafe_stall");
            this.unlockItem.should.be.calledWith("cafe_table_1");
        });
    });

    describe('#unlockItemsByLevel', function() {
        it('correctly calls unlockItems function for levels', function() {
            this.unlockItems = helper.sandbox.stub(this.state.cafe, 'unlockItems');

            this.state.cafe.unlockItemsByLevel(1);
            this.unlockItems.should.be.calledWith(this.state.cafe.unlockDef(1));

            this.state.cafe.unlockItemsByLevel(7);
            this.unlockItems.should.be.calledWith(this.state.cafe.unlockDef(7));
        });
    });
});
