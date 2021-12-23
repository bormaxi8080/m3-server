var path = require('path');
var spawn = require('child_process').spawn;

var TaskUtils = require('./taskUtils');

desc('Запуск контроллера кластера. Параметры запуска: jake [NODE_DEBUG=true] [NODE_DEV=true] server');
task('cluster', ['db:migrate', 'cluster:run']);

namespace('cluster', function() {
    desc('Запуск контроллера кластера. Параметры запуска: jake [NODE_DEBUG=true] [NODE_DEV=true] server');
    task('run', [], function() {
        TaskUtils.spawnBunyanedNodeProcess(['server/initCluster.js'], function(code) {
            console.log('cluster DEATH', code);
            complete();
        });
    }, true);
});
