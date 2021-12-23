var _ = require('lodash');
var path = require('path');
var fork = require('child_process').fork;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var WritableStream = require('memory-streams').WritableStream;

var TaskUtils = module.exports = {};

TaskUtils.echo = function(cmd) {
    return 'echo "' + cmd + '"';
};

TaskUtils.dbShellString = function(db) {
    return [
        (db.password ? 'PGPASSWORD=' + db.password + ' ': ''),
        'psql -U ', db.user, '-h', db.host, '-p', db.port
    ].join(' ');
};

TaskUtils.dbShellExec = function(sql, dbShellString, dbName, callback) {
    console.log("Executing SQL on %s: %s", dbName, sql);
    exec(TaskUtils.echo(sql) + " | " + dbShellString, function(err, stdout, stderr) {
        callback(stderr.match("ERROR") ? stderr : null);
    });
};

TaskUtils.createBunyanProcess = function(runningProc, streams) {
    var bunyanBin = path.normalize('server/node_modules/.bin/bunyan');
    var bunyan = spawn(bunyanBin, ['--no-pager'], {'stdio': streams});
    bunyan.stdin.setEncoding('utf8');

    bunyan.on('exit', function(code) {
        console.log('bunyan DEATH', code);
    });

    bunyan.stdin.on('error', function(data) {
        console.log('--bunyan.stdin.on ERROR--');
    });

    bunyan.stdin.on('close', function(data) {
        console.log('--bunyan.stdin.on CLOSE--');
    });

    if (runningProc) {
        if (bunyan.stdin) {
            runningProc.stdout.setEncoding('utf8');
            runningProc.stderr.setEncoding('utf8');
            runningProc.stdout.pipe(bunyan.stdin);
            runningProc.stderr.pipe(bunyan.stdin);
        }
        runningProc.on('exit', function() {
            bunyan.kill();
        });
    }

    return bunyan;
};

TaskUtils.spawnBunyanedProcess = function(filename, args, onExit) {
    var runningProc = spawn(filename, args, {'stdio': [process.stdin, 'pipe', 'pipe']});
    var bunyan = TaskUtils.createBunyanProcess(runningProc, ['pipe', process.stdout, process.stderr]);

    if (onExit) {
        runningProc.on('exit', function(code) { onExit(code); });
    }
};

TaskUtils.spawnBunyanedNodeProcess = function(args, onExit) {
    var procName = 'node';
    if (process.env.NODE_DEBUG) {
        procName = path.normalize('server/node_modules/.bin/node-debug');
    } else if (process.env.NODE_DEV) {
        procName = path.normalize('server/node_modules/.bin/node-dev');
    }

    TaskUtils.spawnBunyanedProcess(procName, args, onExit);
};

TaskUtils.forkBunyanedNodeProcessWithOutput = function(filename) {
    var runningProc = fork(filename, [], {
        env: process.env,
        silent: true
    });

    var bunyanProcess = TaskUtils.createBunyanProcess(runningProc, ['pipe', 'pipe', 'pipe']);
    var memoryStream = new WritableStream();
    memoryStream.flush = function() {
        memoryStream._writableState.buffer = [];
        memoryStream._writableState.length = 0;
        memoryStream._writableState.writelen = 0;
    };

    bunyanProcess.stdout.pipe(memoryStream);
    bunyanProcess.stderr.pipe(memoryStream);

    runningProc.output = memoryStream;

    runningProc.events = {};
    runningProc.on('message', function(message) {
        _.each(message, function(value, key) {
            runningProc.events[key] = value;
        });
        if (runningProc.onMessage) {
            runningProc.onMessage(message);
        }
    });

    runningProc.on('exit', function(code) {
        if (runningProc.onExit) {
            runningProc.onExit(code, memoryStream);
        }
    });

    return runningProc;
};
