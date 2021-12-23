var _ = require('lodash');

var LastFinishLevelTask = module.exports = function(core) {
    this.core = core;
};

LastFinishLevelTask.prototype.code = 'last_finish_level';
LastFinishLevelTask.prototype.period = 180;

LastFinishLevelTask.prototype.exec = function(hash, callback) {
    var self = this;
    if (hash && _.isPlainObject(hash)) {
        var userIds = Object.keys(hash);
        if (userIds.length) {
            var messages = _.map(hash, function(level, uid) {
                level = parseInt(level);
                return self.core.messageManager.makeMessage(uid, 'relatives', 'booster', {
                    type: 'gingerbread_man',
                    params: {
                        level:level
                    }
                });
            });
            self.core.messageManager.sendMessages(messages, this.core.multiKnex, function(err) {
                callback(err, hash);
            });
        }
    } else {
        callback(null, 'LastFinishLevelTask exec with empty hash');
    }
};
