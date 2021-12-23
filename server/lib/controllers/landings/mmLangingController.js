var _ = require('lodash');
var async = require('async');

var Controller = require('../../net/controller');

MMLangingController = module.exports = Controller(function(core) {
    this.core = core;

    this.middleware = [
        core.middleware.bodyParser,
        core.middleware.journalCollector
    ];
    this.template = core.templates.landings.mm;
});

MMLangingController.prototype.handle = function(task, callback) {
    var self = this;

    var network = {
        network_code: "MM",
        network_id: task.query.vid,
        access_token: task.query
    };

    async.waterfall([
        function(cb) { self.core.middleware.authorizer.authorizeNetwork(network, cb); },
        function(cb) { self.core.networkStorage.ensureStorage("MM", task.query.vid, cb); }
    ], function(err, newStorageSession, sessionId) {
        if (err) {
            task.controllerError("MMLangingController", 403, err, 'auth_error');
            return callback();
        }

        var flashvars = _.extend(task.query, {
            url_path: "https://match3test.plamee.com/facebook/client/",
            session: sessionId,
            storage: newStorageSession
        });

        var responceHTML = _.template(self.template)({flashvars: JSON.stringify(flashvars)});

        task.replyHTML(200, {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }, responceHTML);
        return callback();
    });
};
