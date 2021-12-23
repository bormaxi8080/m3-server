var _ = require('lodash');
var request = require('request');

module.exports = function(networkCode, networkId, accessToken, config, callback) {
    if (process.env.IN_PRODUCTION === 'false') {
        return callback();
    }

    return callback({error: {code: 'auth_error', message: 'odnoklassniki_error'}});
};
