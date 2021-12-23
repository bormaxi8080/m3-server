var http = require('http');
var path = require('path');
var async = require('async');
var domain = require('domain');

var WebSocketServer = require('ws').Server;

var utils = require('./utils');
var Server = require('./server');
var Logger = require('./logger');

var DefManager = require('./defs/defManager');
var DefCacher = require('./defs/defCacher');

var LocaleManager = require('./localeManager');
var LocaleCacher = require('./locale/localeCacher');

var SheduleManager = require('./sheduleManager');
var MessageManager = require('./messageManager');

var Cluster = module.exports = function(configPath) {
    this.config = Cluster.loadConfig(configPath);
    this.logger = new Logger(this.config.cluster.logger);

    this.multiKnex = Server.loadMultiKnex(this.config, this.logger);
    this.standaloneKnex = Server.loadStandaloneKnex(this.config, this.logger);
    this.redis = Server.loadRedis(this.config, this.logger);

    this.defManager = new DefManager(this);
    this.defCacher = new DefCacher(this);

    this.localeManager = new LocaleManager(this);
    this.localeCacher = new LocaleCacher(this);

    this.sheduleManager = new SheduleManager(this);
    this.messageManager = new MessageManager(this);

    this.sheduleManager.start(this.config.cluster.shedule.check_period * 1000);
};

Cluster.loadConfig = function(configPath) {
    return {
        cluster: utils.loadYaml(path.join(configPath, "cluster.yml")),
        db: utils.loadYaml(path.join(configPath, "db.yml")),
        redis: utils.loadYaml(path.join(configPath, "redis.yml")),
    };
};

Cluster.prototype.beforeRun = function(callback) {
    var self = this;
    async.waterfall([
        function(cb) { cb(null, require('../import/map.json')); },
        function(map, cb) { self.defManager.importMap(map, cb); },
        function(result, cb) { self.defManager.reload(cb); },
    ], callback);
};

Cluster.prototype.run = function() {
    var self = this;
    this.beforeRun(function(err) {
        if (err) {
            throw new Error(err);
        }

        if (process.send) { // Cluster is spawned via `fork`, used for integrational tests
            process.send({start: true});
        }

        self.defManager.export();
        self.listenHttp(self.config.cluster.http_port);
        self.listenWs(self.config.cluster.ws_port);
    });
};

Cluster.prototype.listenWs = function(port) {
    var self = this;
    this.wsServer = new WebSocketServer({port: port});
    console.log('Start listening Websockets on ' + port);
    this.clients = [];

    this.wsServer.on('connection', function(ws) {
        self.clients.push(ws);
        self.logger.info('New game server connected to cluster; Current count: ' + self.clients.length);

        ws.reply = function(msg) {
            if (msg) {
                ws.send(JSON.stringify(msg));
            }
        };

        ws.on('message', function(message) {
            ws.reply(self.handleServerMessage(JSON.parse(message)));
        });

        ws.on('close', function() {
            self.clients.splice(self.clients.indexOf(ws), 1);
            self.logger.info('Game server disconnected from cluster; Current count: ' + self.clients.length);
        });
    });
};

Cluster.prototype.listenHttp = function(port) {
    var self = this;
    var httpServer = http.createServer(function(req, res) {
        var d = domain.create();
        d.on('error', function(error) {
            try {
                self.logger.error('DOMAIN ERROR: ' + error, d && d.post_params);
                self.logger.error('DOMAIN STACK: ' + error.stack);
                d.task.reply(500, { 'Content-Type': 'text/plain' }, {
                    error_code: 'internal_error'
                });
            } catch (error_2) {
                self.logger.error('Error sending 500!', error_2.stack);
            }
        });
        d.add(req);
        d.add(res);
        d.run(function() {
            d.task = new Task(req, res, self);
            self.router.handle(d.task, function() { });
        });
    });

    console.log('Start listening HTTP on ' + port);
    httpServer.listen(port, "0.0.0.0");
    this.httpServer = httpServer;
};

Cluster.prototype.handleServerMessage = function(message) {
    if (message.type === 'notify') {
        return {type: 'defs', data: this.defManager.export()};
    } else {
        this.logger.warn('Unknown server message type: ' + message.type);
    }
};
