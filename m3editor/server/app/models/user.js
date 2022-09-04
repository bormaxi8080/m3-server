var crypto = require('crypto');

var User = module.exports = {};

User.hashPassword = function(salt, password) {
    return crypto.createHash('sha1').update(salt + password).digest('hex');
};
