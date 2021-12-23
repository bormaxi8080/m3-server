var Journal = require('../../journal');
var Utils = require('../../utils');

var GameLogicError = require('../../gameLogicError.js');

var ClaimSharingRewardCommand = module.exports = {};

ClaimSharingRewardCommand.validateParams = function(params) {
    return true;
};

ClaimSharingRewardCommand.execute = function(state, params) {
    state.socialNetworks.claimSharingReward();
    Journal.event('claim_sharing_reward', params);
};
