var crypto = require('crypto');

var Session = module.exports = {};

Session.generateId = function(user_id, user_hash) {
    return crypto.createHash('sha1').update(Date.now() + user_id + user_hash).digest('hex');
};
