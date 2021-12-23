var _ = require('lodash');

var fs = require('fs');
var path = require('path');
var async = require('async');
var utils = require('../lib/utils');

var Server = require('../lib/server');

var config = Server.loadConfig(process.env.CONFIG_PATH);

var migrationTemplate = function(name, version) {
    var s = "var Migration{{version}} = function() {\n" +
        "    this.name = \"{{name}}\";\n" +
        "    this.version = {{version}};\n\n" +
        "    this.migrateState = function(state, logger) {\n"+
        "    };\n\n" +
        "};\n\n"+
        "module.exports = new Migration{{version}}();\n";
    return s.replace(/{{version}}/g, version)
         .replace(/{{name}}/g, name);
};

namespace('migration', function() {
    var migrationFolderPath = path.join(process.env.SERVER_PATH, 'migrations/state');

    desc('Создание миграции стейта - migration:create[name]');
    task('create', [], function(name) {
        if (!name) {
            fail("Migration name is not specified");
        }
        var version = utils.formatDate(new Date(), "%Y%m%d%H%M%S");
        var migrationName = version + "_" + name;
        var migrationPath = path.join(migrationFolderPath, migrationName + ".js");
        fs.writeFileSync(migrationPath, migrationTemplate(name, version));

        console.log("Migration \"%s\" saved to file: %s", name, migrationPath);
    });
});
