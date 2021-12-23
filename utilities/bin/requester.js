#!/usr/bin/env node

var _ = require('lodash');

var path = require('path');
var Fiber  = require('fibers');
var program = require('commander');

var Reporter = require('../lib/reporter');
var Server = require('../lib/server');

var ROOT_PATH = path.resolve(path.join(__dirname, '..'));

program
    .version('0.0.1')
    .usage('[options]')
    .option('-s, --server [local]', 'Select server', 'local')
    .option('-c, --concurrency [number]', 'Number of tasks running in parallel', 1)
    .option('-n, --number [number]', 'Number of request by each concurrent runner', 1)
    .option('-x, --scenario [name]', 'Select scenario')
    .option('--network [name]', 'Select network code')
    .option('--id [number]', 'Select network id')
    .option('--uid [number]', 'User id')
    .option('-v, --verbose', 'Verbose output for server requests')
    .option('-d --dot', 'Show dot on completed scenarion iteration')
    .parse(process.argv);

Fiber(function() {
    var server = Server.byId(program.server, {verbose: program.verbose});

    var concurrency = program.concurrency;
    global.reporter = new Reporter(concurrency);

    var number = program.number;
    var records =  _.range(0, program.records);

    if (!program.scenario) {
        console.log("No scenario given. Exiting");
        process.exit(1);
    }

    var scenario = require(path.join(ROOT_PATH, './scenarios/', program.scenario));

    if (program.network && program.id) {
        server.setupClientNetwork(program.network, program.id);
    }

    var executionFlow = function(reporter, id) {
        for (var i = 0; i < number; ++i) {
            scenario(server, records, program);
            if (program.dot) {
                process.stdout.write('.');
            }
        }
        global.reporter.finish();
    };

    var tasks = _.range(0, concurrency).map(function(id) {
        return Fiber(function() {
            executionFlow(reporter, id);
        });
    });

    global.reporter.start();
    _.each(tasks, function(task) {
        task.run();
    });
}).run();

process.on('SIGINT', function() {
    console.log("Interrupting");
    if (global.reporter) {
        global.reporter.stop();
        global.reporter.printRequestsStats();
    }
    process.exit();
});
