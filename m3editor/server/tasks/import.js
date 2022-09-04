var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var async = require('async');
var request = require('request');

var loadYaml = function(path) {
    return yaml.safeLoad(fs.readFileSync(fs.realpathSync(path), 'utf8'));
};

var configPath = path.join(__dirname, '../config', process.env.NODE_ENV + '.yml');
var config = loadYaml(configPath);

desc('Преобразование уровней в JSON');
task('import', function() {
    var knex = require('../lib/db')(config.db);
    request.get({
        url:     "https://match3test.plamee.com/export/json/all"
    }, function(err, resp, data) {
        if (err) { throw new Error(err); }
        var levels = JSON.parse(data).levels;
        async.waterfall([
            function(cb) { knex.del().from('levels').exec(cb); },
            function(result, cb) {
                knex
                .insert(levels.map(function(level) {
                    delete level.id;
                    return level;
                }))
                .into('levels')
                .exec(cb);
            }
        ], function(err) {
            console.log(err || "OK");
            complete();
        });
    });
}, true);
