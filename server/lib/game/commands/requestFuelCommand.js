var utils = require('../../utils');

var RequestFuelCommand = module.exports = {};

RequestFuelCommand.middleware = ['sendMessages'];

RequestFuelCommand.validateParams = function(params) {
    return !!(params && utils.isInteger(params.user_id) && (params.user_id > 0));
};

RequestFuelCommand.execute = function(state, params) {
    var chapter = state.chapter.getLockedChapter();
    if (chapter === undefined) {
        throw 'There are no locked chapters';
    }
    state.chapter.addRequest(chapter.id, params.user_id);
    var messParams = {chapter_id: chapter.id};
    if (params.fb_request_id) {
        messParams.fb_request_id = params.fb_request_id;
    }
    state.messages.addOutgoing(params.user_id, 'request_fuel', messParams);
};
