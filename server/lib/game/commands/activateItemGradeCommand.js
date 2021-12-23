var _ = require('lodash');

var Journal = require('../../journal');
var Utils = require('../../utils');

var GameLogicError = require('../../gameLogicError.js');

var ActivateItemGradeCommand = module.exports = {};

ActivateItemGradeCommand.validateParams = function(params) {
    return _.isString(params.item) && Utils.isInteger(params.grade) && params.grade >= 0;
};

ActivateItemGradeCommand.execute = function(state, params) {
    var item = params.item;
    var grade = params.grade;

    state.cafe.checkItemExists(item);
    var itemState = state.cafe.itemState(item);

    if (itemState.grades.indexOf(grade) < 0) {
        throw new GameLogicError("Cafe item " + item + " grade " + grade + " not found in state");
    }

    state.data.set(state.cafe.itemStateActiveGradeProp(item), grade);
    Journal.event('activate_item', params);
};
