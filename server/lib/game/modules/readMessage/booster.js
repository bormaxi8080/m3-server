var Journal = require('../../../journal');

module.exports = function(message) {
    var params = {};
    params[message.params.type] = message.params.params;
    this.state.addEvent('add_boosters', params);
    Journal.event('add_boosters', params);
};
