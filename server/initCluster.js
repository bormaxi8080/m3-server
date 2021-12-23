var path = require('path');
var Cluster = require('./lib/cluster');
process.env.NODE_ENV  = process.env.NODE_ENV || 'development';
var configPath = path.join(__dirname, 'config', process.env.NODE_ENV);
var cluster = new Cluster(configPath);

cluster.run();
