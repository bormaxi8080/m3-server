var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var Mocha = require('mocha');
var TaskUtils = require('./taskUtils');
var mochaPath = path.join(process.env.SERVER_PATH, "node_modules/.bin/mocha");

var useColors = !(process.env.NO_COLORS);

desc('Запуск автоматических тестов');
task('test', ['test:server', 'test:integration']);

namespace('test', function() {
    desc('Запуск интеграционных тестов');
    task('integration', ['reset'], function() {

        var DelayedInitProcess = function(initPath, name) {
            this.proc = null;
            this.init = function() {
                this.proc = TaskUtils.forkBunyanedNodeProcessWithOutput(path.join(process.env.SERVER_PATH, initPath));
                this.proc.onMessage = this.onMessage;
                this.proc.onExit = function(code, output) {
                    console.log(name + ' DEATH', code);
                    console.log(output.toString());
                    process.exit(code);
                };
                return this;
            };

            this.flush = function() { this.proc && this.proc.output.flush(); };
            this.kill = function() { this.proc && this.proc.kill(); };
            this.log = function() { this.proc && console.log("\n\n%s OUTPUT: %s", name, this.proc.output.toString()); };
        };

        var server = new DelayedInitProcess('init.js', 'SERVER');
        var cluster = new DelayedInitProcess('initCluster.js', 'CLUSTER');
        var processes = [cluster, server];

        var flushAll = function() { processes.forEach(function(proc) { proc.flush(); }); };
        var killAll = function() { processes.forEach(function(proc) { proc.kill(); }); };
        var logAll = function() { processes.forEach(function(proc) { proc.log(); }); };

        setTimeout(function() {
            if (!testsStarted) {
                killAll();
                logAll();
                fail("Timeout on server startup: 10 sec");
            }
        }, 10000);

        process.on('exit', function() {
            killAll();
        });

        var probeProcessCondition = function() {
            if (cluster.proc && cluster.proc.events.start && !server.proc) {
                server.init();
            } else if (server.proc && server.proc.events.start && server.proc.events.defs && cluster.proc && cluster.proc.events.start) {
                flushAll();
                startTests();
            }
        };

        cluster.onMessage = server.onMessage = probeProcessCondition;
        cluster.init();

        var filedTestOutput = "";

        var inTest = false;
        var testsStarted = false;
        var errorGuardFunc = function(err) {
            if (!inTest) {
                killAll();
                logAll();
                fail(err);
            }
        };

        var startTests = function() {
            testsStarted = true;
            jake.addListener('error', errorGuardFunc);

            var mocha = new Mocha({
                ui: 'mocha-fibers',
                reporter: 'dot',
                bail: false,
                useColors: useColors
            });

            var testPath = path.join(process.env.SERVER_PATH, 'test/integration/scenarios');

            var collectTests = function(dir) {
                var reduceTests = function(memo, dir) {
                    return fs.readdirSync(dir).reduce(function(result, fileName) {
                        var file = path.join(dir, fileName);

                        if (fs.statSync(file).isDirectory()) {
                            reduceTests(memo, file);
                        } else if (path.extname(fileName) === '.js') {
                            memo.push(file);
                        }
                        return memo;
                    }, memo);
                };
                return reduceTests([], dir);
            };

            collectTests(testPath).forEach(function(test) {
                mocha.addFile(test);
            });

            var testRunner = mocha.run(function(failCount) {
                jake.removeListener('error', errorGuardFunc);
                if (failCount) {
                    console.log(filedTestOutput);
                    fail();
                } else {
                    complete();
                }
            });

            testRunner.on('test', function(test) {
                inTest = true;
            });

            testRunner.on('test end', function(test) {
                inTest = false;

                if (test.state === 'failed') {
                    var titles = [test.title];
                    var parent = test.parent;
                    while (parent) {
                        titles.push(parent.title);
                        parent = parent.parent;
                    }

                    filedTestOutput += "\n\n######\nFailed test: " + titles.reverse().join(" ") + "\n" +
                        "\nServer output:\n" + server.proc.output.toString() +
                        "\nCluster output:\n" + cluster.proc.output.toString();
                } else {
                    flushAll();
                }
            });
        };
    }, true);

    desc('Запуск серверных unit-тестов');
    task('server', [], function() {
        var mochaArgs = [
            path.join(process.env.SERVER_PATH, 'test/unit'),
            '--recursive', '-R', 'dot', '--check-leaks'
        ];

        if (!useColors) {
            mochaArgs.push('--no-colors');
        }

        var testProcess = spawn(mochaPath, mochaArgs, {stdio: 'inherit'});
        testProcess.on('close', function(code) {
            if (code !== 0) {
                console.log('Unit tests finished with code ' + code);
                fail();
            } else {
                complete();
            }
        });

    }, true);
});
