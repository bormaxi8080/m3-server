var path = require('path');
var spawn = require('child_process').spawn;

if (process.argv[2] && process.argv[2].indexOf('test') === 0) {
    process.env.NODE_ENV  = process.env.NODE_ENV || 'test';
} else {
    process.env.NODE_ENV  = process.env.NODE_ENV || 'development';
}

process.env.ROOT_PATH = __dirname;
process.env.SERVER_PATH = path.join(__dirname, 'server');
process.env.CONFIG_PATH = path.join(process.env.SERVER_PATH, 'config', process.env.NODE_ENV);

var utils = require('./server/lib/utils');
utils.requireDir(path.join(__dirname, 'server/tasks'));

jake.addListener('complete', function() { process.exit(); });

desc("Пересоздание всех БД и сброс кэшей");
task('reset', ['db:recreate', 'redis:flush'], function(params) {
    complete();
}, true);

task('default', ['reset', 'server'], function(params) {
    complete();
}, true);
