var _ = require('lodash');
var utils = require('../../../utils');

module.exports = function(networkCode, networkId, accessToken, config, callback) {
    var secret = config.authorize.secret;

    if (process.env.IN_PRODUCTION === 'false') {
        return callback();
    }

    var sig = accessToken.sig;
    delete accessToken.sig;

    var str = Object.keys(accessToken).sort().reduce(function(memo, key) {
        return memo + key + "=" + accessToken[key];
    }, "") + secret;

    if (sig === utils.hashString(str, "md5")) {
        return callback();
    } else {
        console.log(sig);
        console.log(str);
        console.log(utils.hashString(str, "md5"));
        return callback({error: {code: 'auth_error', message: 'incorrect_signature'}});
    }
};
