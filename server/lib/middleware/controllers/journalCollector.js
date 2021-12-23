var Journal = require('../../journal');

var JournalCollector = module.exports = function(core) {
    this.core = core;
};

JournalCollector.prototype.before = function(task, next) {
    task.journal = new Journal(this.core);
    next();
};

JournalCollector.prototype.after = function(task, next) {
    task.journal.flush(task.userId, task.sessionId, next);
};
