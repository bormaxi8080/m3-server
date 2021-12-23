var Journal = require('../../../journal');

module.exports = function(message) {
    var defKey = 'social_networks.' + message.params.network_code + '.invite.reward';

    var reward = this.state.defs.get(defKey);
    if (message.reward) { reward = message.reward; }

    this.state.player.addBalance(reward);
    Journal.event('invite_reward', message);
};
