var path = require('path');
var spawn = require('child_process').spawn;

var TaskUtils = require('./taskUtils');

desc('Запуск сервера. Параметры запуска: NODE_DEBUG=true] [NODE_DEV=true] server');
task('server', ['db:migrate', 'server:run']);

namespace('server', function() {
    desc('Запуск сервера. Параметры запуска: jake [NODE_DEBUG=true] [NODE_DEV=true] server');
    task('run', [], function() {
        TaskUtils.spawnBunyanedNodeProcess(['server/init.js'], function(code) {
            console.log('server DEATH', code);
            complete();
        });
    }, true);
});
