var Journal = require('./../../journal');

var LikeCommand = module.exports = {};

LikeCommand.validateParams = function(params) {
    return !!params && !!params.network_code;
};

LikeCommand.execute = function(state, params) {
    var networkCode = params.network_code;
    state.socialNetworks.checkSocialNetworkDefined(networkCode);
    state.socialNetworks.like(networkCode);
    Journal.event('like', params);
};
