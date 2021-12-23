var crypto = require("crypto");

module.exports = function(networkCode, networkId, accessToken, config, callback) {
    var signature = networkCode + '_' + networkId + '_' + config.authorize.secret;
    var expectedToken = crypto.createHash("sha1").update(signature, "utf-8").digest("hex");

    if (accessToken === expectedToken) {
        callback();
    } else {
        callback({error: {code: 'auth_error', message: 'incorrect_signature'}});
    }
};
