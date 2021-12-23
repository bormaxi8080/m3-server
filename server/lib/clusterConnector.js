var WebSocket = require('ws');

var ClusterConnector = module.exports = function(core) {
    this.core = core;
    this.logger = this.core.logger;
    this.cluster = null;
    this.config = this.core.config.app.cluster;
};

ClusterConnector.clusterURL = function(clusterConfig) {
    return 'ws://' + clusterConfig.host + ':' + clusterConfig.port;
};

ClusterConnector.prototype.connect = function() {
    var self = this;

    if (this.cluster) {
        return this.logger.warn("Cluster already connected");
    }

    var clusterURL = ClusterConnector.clusterURL(this.config);
    var reconnectDelay = this.config.reconnect;
    var clusterInfo = function(text) { return "Cluster (" + clusterURL + "); " + text; };

    var ws = new WebSocket(clusterURL);

    ws.on('open', function() {
        self.logger.info(clusterInfo("Connected"));
        if (!self.cluster) {
            self.cluster = ws;
            self.notifyCluster();
        } else {
            self.logger.error("Other cluster allready connected");
            wc.close();
        }
    });

    ws.on('message', function(message, flags) {
        self.handleClusterMessage(JSON.parse(message), flags);
    });

    ws.on('close', function() {
        self.logger.warn(clusterInfo("Disconnected"));
        self.cluster = null;
        self.reconnect();
    });

    ws.on('error', function(e) {
        if (self.cluster) {
            self.logger.warn(clusterInfo(e.toString()));
        } else {
            self.logger.warn(clusterInfo("Failed to connect: " + e.toString()));
        }
        self.reconnect();
    });
};

ClusterConnector.prototype.reconnect = function() {
    var self = this;
    var delay = this.config.reconnect;
    this.disconnect();
    this.logger.info("Reconnecting cluster in " + delay + " seconds");
    setTimeout(function() {
        self.connect();
    }, delay * 1000);
};

ClusterConnector.prototype.disconnect = function() {
    if (this.cluster) {
        this.logger.info("Cluster disconnecting");
        this.cluster.close();
        this.cluster = null;
    }
};

ClusterConnector.prototype.send = function(message) {
    if (this.cluster) {
        this.cluster.send(JSON.stringify(message));
    }
};

ClusterConnector.prototype.notifyCluster = function() {
    this.logger.info("Notifying cluster");
    this.send({type: 'notify'});
};

ClusterConnector.prototype.handleClusterMessage = function(message, flags) {
    if (message.type === 'defs') {
        this.core.defKeeper.import(message.data);
        this.logger.info("Defs updated from cluster master");
        return null;
    } else {
        this.logger.warn('Unknown cluster message type: ' + message.type);
    }
};

