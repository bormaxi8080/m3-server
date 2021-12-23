var _ = require('lodash');

var fs = require('fs');
var path = require('path');
var async = require('async');

var http = require('http');
http.globalAgent.maxSockets = 100;

var redis = require('redis');
var domain = require('domain');

var redisWrapper = require('./redisWrapper');

var Task = require('./task');
var Logger = require('./logger');
var Router = require('./net/router');
var MultiKnex = require('./data/multiKnex');
var utils = require('./utils');

var SessionManager = require('./sessionManager');
var NetworkManager = require('./networkManager');
var JournalManager = require('./journalManager');
var UserManager = require('./userManager');
var LevelManager = require('./levelManager');
var DefKeeper = require('./defs/defKeeper');
var DefCacher = require('./defs/defCacher');
var MessageManager = require('./messageManager');
var InviteManager = require('./inviteManager');
var SheduleManager = require('./sheduleManager');
var MigrationManager = require('./migrationManager');

var NetworkStorage = require('./networkStorage');

var CommandProcessor = require('./commandProcessor');
var ClusterConnector = require('./clusterConnector');

var LocaleManager = require('./localeManager');
var LocaleCacher = require('./locale/localeCacher');

var Server = module.exports = function(configPath) {
    this.config = Server.loadConfig(configPath);
    process.env.IN_PRODUCTION = this.inProduction = this.config.app.production;

    this.logger = new Logger(this.config.app.logger);
    this.multiKnex = Server.loadMultiKnex(this.config, this.logger);
    this.standaloneKnex = Server.loadStandaloneKnex(this.config, this.logger);
    this.redis = Server.loadRedis(this.config, this.logger);

    this.defKeeper = new DefKeeper();
    this.defCacher = new DefCacher(this);
    this.journalManager = new JournalManager(this);

    this.sessionManager = new SessionManager(this);
    this.networkManager = new NetworkManager(this);
    this.userManager = new UserManager(this);
    this.levelManager = new LevelManager(this);
    this.messageManager = new MessageManager(this);
    this.inviteManager = new InviteManager(this);
    this.sheduleManager = new SheduleManager(this);
    this.migrationManager = new MigrationManager(this, MigrationManager.loadMigrations());

    this.networkStorage = new NetworkStorage(this);
    this.templates = utils.requireDir(path.join(__dirname, '../templates'), {nested: true, exts: ['.erb']}, function(file) {
        return fs.readFileSync(file).toString();
    });

    this.middleware = utils.requireInstances(this, path.join(__dirname, 'middleware/controllers'), {exclude: ['authorizers']});
    this.controllers = utils.requireInstances(this, path.join(__dirname, 'controllers'));

    this.commandProcessor = new CommandProcessor(this);
    this.clusterConnector = new ClusterConnector(this);

    this.localeManager = new LocaleManager(this);
    this.localeCacher = new LocaleCacher(this);

    this.router = new Router(this.controllers.missingController, this.routes());
};

Server.prototype.routes = function() {
    return {
        'commands': this.controllers.commandController,
        'defs': this.controllers.defsController,
        'storage/get': this.controllers.getStorageController,
        'storage/fetch': this.controllers.fetchStorageController,
        'storage/store': this.controllers.storeStorageController,
        'init': this.controllers.initController,
        'locale': this.controllers.localeController,
        'map/chapter': this.controllers.chapterMapController,
        'map/level': this.controllers.levelMapController,
        'messages/unread': this.controllers.unreadMessagesController,
        'query/users': this.controllers.usersQueryController,
        'query/users/progress': this.controllers.usersProgressQueryController,
        'query/users/levels': this.controllers.usersLevelsQueryController,
        'query/users/time': this.controllers.usersTimeQueryController,
        'query/levels': this.controllers.levelsQueryController,
        'reset': this.controllers.resetController, // Note: this is a non-production controller!
        'session/get': this.controllers.getSessionController,
        'session/update': this.controllers.updateSessionController,
        'invites/store': this.controllers.storeInvitesController,
        'invites/fetch': this.controllers.fetchInvitesController,
        'landings/mm.html': this.controllers.mmLangingController,
        'static': this.controllers.staticController
    };
};

Server.loadConfig = function(configPath) {
    return {
        app: utils.loadYaml(path.join(configPath, "app.yml")),
        db: utils.loadYaml(path.join(configPath, "db.yml")),
        redis: utils.loadYaml(path.join(configPath, "redis.yml")),
        init: require(path.join(configPath, "init.json"))
    };
};

Server.loadMultiKnex = function(config, logger) {
    return new MultiKnex(config.db.shardable, logger || Logger.consoleLogger());
};

Server.loadRedis = function(config, logger) {
    var client = redis.createClient(config.redis.port, config.redis.host, logger || Logger.consoleLogger());
    return client;
};

Server.loadStandaloneKnex = function(config, logger) {
    return MultiKnex.createKnexInstance(config.db.standalone, config.db.standalone.database, logger || Logger.consoleLogger());
};

Server.prototype.getDomainTask = function() {
    if (!domain.active) {
        throw new Error("Domain missing");
    } else if (!domain.active.task) {
        throw new Error("Task missing in domain");
    }
    return domain.active.task;
};

Server.prototype.run = function() {
    var self = this;
    if (process.send) { // Server is spawned via `fork`, used for tests
        this.defKeeper.onImport = function() {
            process.send({defs: true});
        };
    }

    this.clusterConnector.connect();
    this.listen(this.config.app.port);

    if (process.send) { // Server is spawned via `fork`, used for tests
        process.send({start: true});
    }
};

Server.prototype.listen = function(port) {
    var self = this;
    var httpServer = http.createServer(function(req, res) {
        var d = domain.create();
        d.on('error', function(error) {
            try {
                self.logger.error('DOMAIN ERROR: ' + error, d && d.post_params);
                self.logger.error('DOMAIN STACK: ' + error.stack);
                setTimeout(function() {
                    d.task.reply(500, { 'Content-Type': 'text/plain' }, {
                        error_code: 'internal_error'
                    });
                }, 10);
            } catch (error_2) {
                self.logger.error('Error sending 500!', error_2.stack);
            }
        });
        d.add(req);
        d.add(res);
        d.run(function() {
            d.task = new Task(req, res, self);
            var start = Date.now();
            self.router.handle(d.task, function() {
                var delta = Date.now() - start;
                self.logger.info(req.method + "(" + delta + "ms):" + req.url);
                d.task.reply(200, {}, {});
            });
        });
    });

    console.log('Start listening HTTP on ' + port);
    httpServer.listen(port, "0.0.0.0");
    this.httpServer = httpServer;
};
