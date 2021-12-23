var _ = require('lodash');
var request = require('request');

module.exports = function(networkCode, networkId, accessToken, config, callback) {
    var authorizeUrl = config.authorize.url;

    if (process.env.IN_PRODUCTION === 'false') {
        return callback();
    }

    var requestUrl = _.template(authorizeUrl)({ accessToken: accessToken });
    request(requestUrl, function(err, response, body) {
        if (err) {
            return callback({error: {code: 'auth_error', message: 'facebook_error'}});
        }

        var facebookId;
        try {
            facebookId = JSON.parse(body).id;
        } catch (err2) {
            return callback({error: {code: 'auth_error', message: 'facebook_error'}});
        }

        if (facebookId == networkId) {
            callback();
        } else {
            callback({error: {code: 'auth_error', message: 'facebook_incorrect_token'}});
        }
    });
};
