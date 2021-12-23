var SessionHandler = module.exports =  function(session) {
    this.session = session;
    this.lastCommandId = 0;
};

SessionHandler.prototype.nextCommandId = function() {
    this.lastCommandId++;
    return this.lastCommandId;
};

SessionHandler.prototype.resetCommandId = function() {
    this.lastCommandId = 0;
};
