var SessionValidator = module.exports = function(core) {
    this.core = core;
};

SessionValidator.prototype.before = function(task, next) {
    if (!task.post.session) {
        return next({error: {code: 'session_error', message: 'session_missing'}});
    }

    task.sessionId = task.post.session;
    this.core.sessionManager.fetchSession(task.sessionId, function(err, session) {
        if (err) {
            return next({error: {code: 'session_error'}});
        }
        if (!session) {
            return next({ error: {code: 'session_error', message: 'session_not_found'}});
        }
        task.session = session;
        task.userId = session.user;
        next();
    });
};
