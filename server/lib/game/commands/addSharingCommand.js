var Journal = require('./../../journal');
var Utils = require('../../utils');

var AddSharingCommand = module.exports = {};

AddSharingCommand.validateParams = function(params) {
    return Utils.hasFields(params, ['activity', 'network_code', 'sharing_id']);
};

AddSharingCommand.execute = function(state, params) {
    var networkCode = params.network_code;
    var sharingId = params.sharing_id;
    state.socialNetworks.checkSocialNetworkDefined(networkCode);
    state.socialNetworks.sharing(networkCode, sharingId);
    Journal.event('add_sharing', params);
};
