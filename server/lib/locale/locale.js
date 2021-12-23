var utils = require('../utils');

var Locale = module.exports = function(data) {
    this.data = data;
    this.hash = utils.hashObject(data);
};
