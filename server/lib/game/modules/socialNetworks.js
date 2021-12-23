var _ = require('lodash');

var Utils = require('../../utils.js');

var AccessProtocolError = require('../../accessProtocolError.js');
var GameLogicError = require('../../gameLogicError.js');

var MethodAccessorGenerator = require('../methodAccessorGenerator.js');

var SocialNetworks = module.exports = function(state) {
    this.state = state;
    this.data = state.data;
    this.defs = state.defs;
};

MethodAccessorGenerator.injectDefAccessor(SocialNetworks.prototype, "socialNetwork", "SocialNetwork", "social_networks");
MethodAccessorGenerator.injectStateAccessor(SocialNetworks.prototype, "socialNetwork", "SocialNetwork", "social_networks", {default: {like: false, last_sharing_id: null}});

SocialNetworks.prototype.like = function(networkCode) {
    var like = this.socialNetworkState(networkCode).like;
    if (!like) {
        this.socialNetworkState(networkCode).like = true;
        this.state.player.applyReward(this.socialNetwork(networkCode).like.reward);
    }
};

SocialNetworks.prototype.checkSharingIsValid = function(networkCode, sharingId) {
    if (networkCode === "FB") {
        var regexp = /^[0-9]+_[0-9]+$/;
        if (!regexp.test(sharingId)) {
            throw new AccessProtocolError("Facebook 'sharing_id' parameter invalid format");
        }
        var lastSharingId = this.socialNetworkState(networkCode).last_sharing_id;
        if (lastSharingId && parseInt(lastSharingId.split("_")[1]) >= parseInt(sharingId.split("_")[1])) {
            throw new AccessProtocolError("Outdated Facebook 'sharing_id' parameter value");
        }
    }
};

SocialNetworks.prototype.claimSharingReward = function() {
    var reward = this.state.data.getOrDefault("social_networks.sharing_reward", {});
    if (_.isEmpty(reward)) {
        throw new GameLogicError("Sharing reward is not available");
    }
    this.state.player.applyReward(reward);
    this.state.data.set("social_networks.sharing_reward", {});
};

SocialNetworks.prototype.sharing = function(networkCode, sharingId) {
    this.checkSharingIsValid(networkCode, sharingId);
    this.socialNetworkState(networkCode).last_sharing_id = sharingId;

    var oldSharingCount = this.state.data.get("sharing_count");
    var newSharingCount = oldSharingCount + 1;
    this.state.data.set("sharing_count", newSharingCount);

    var lastReward = this.state.data.getOrDefault("social_networks.sharing_reward", {});
    var reward = this.calculateReward(oldSharingCount, newSharingCount);
    this.state.data.set("social_networks.sharing_reward", this.state.player.accumulateReward(lastReward, reward));
};

SocialNetworks.prototype.calculateReward = function(oldSharingCount, newSharingCount) {
    var self = this;
    if (newSharingCount > oldSharingCount) {
        return this.defs.get("sharings").reduce(function(memo, cond) {
            if (oldSharingCount < cond.count && newSharingCount >= cond.count) {
                self.state.player.accumulateReward(memo, cond.reward);
            }
            return memo;
        }, {});
    }
    else {
        return {};
    }
};
