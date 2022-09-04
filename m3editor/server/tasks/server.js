var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var ROOT = path.normalize(path.join(__dirname, "../.."));

desc('Запуск сервера');
task('server', ['server:build', 'server:run']);

namespace('server', function() {
    desc('Запуск процесса сервера');
    task('run', [], function() {
        var serverPath = path.join(ROOT, 'server/app.js');
        var server = spawn('node', [serverPath], {'stdio': [process.stdin, process.stdout, process.stderr]});

        server.on('exit', function(code) {
            console.log("Server stopped");
            complete();
        });

        process.on('exit', function() {
            server.kill();
            console.log("Server stopped");
            complete();
        });
    }, true);

    desc('Подготовка окружения для запуска сервера');
    task('build', ['db:migrate']);
});
