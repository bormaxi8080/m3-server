var path = require('path');
var Server = require('./lib/server');
process.env.NODE_ENV  = process.env.NODE_ENV || 'development';
var configPath = path.join(__dirname, 'config', process.env.NODE_ENV);
var server = new Server(configPath);

server.run();
