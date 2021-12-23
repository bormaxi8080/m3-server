var _ = require('lodash');

var Journal = require('../../journal');
var Utils = require('../../utils');

var GameLogicError = require('../../gameLogicError.js');

var BuyItemGradeCommand = module.exports = {};

BuyItemGradeCommand.validateParams = function(params) {
    return _.isString(params.item) && Utils.isInteger(params.grade) && params.grade > 0;
};

BuyItemGradeCommand.execute = function(state, params) {
    var item = params.item;
    var grade = params.grade;

    state.cafe.checkItemExists(item);

    var itemState = state.cafe.itemState(item);
    var gradeDef = state.cafe.itemGrades(item)[grade - 1];

    if (!gradeDef) {
        throw new GameLogicError("Cafe item " + item + " grade " + grade + " is not defined");
    }

    if (itemState.grades.indexOf(grade) >= 0) {
        throw new GameLogicError("Cafe item " + item + " grade " + grade + " already exists in state");
    }

    state.player.reduceBalance(gradeDef.price);
    state.data.push(state.cafe.itemStateGradesProp(item), grade);
    Journal.event('buy_item_grade', params);
};
