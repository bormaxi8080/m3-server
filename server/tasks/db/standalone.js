var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

var TaskUtils = require('../taskUtils');
var Server = require('../../lib/server');

var config = Server.loadConfig(process.env.CONFIG_PATH);

namespace('standalone', function() {
    var migratorConfig = {
        directory: path.join(process.env.SERVER_PATH, 'migrations/standalone')
    };
    var database = config.db.standalone.database;
    var dbShellString = TaskUtils.dbShellString(config.db.standalone);

    desc('Удаление базы данных');
    task('drop', [], function() {
        console.log("Dropping standalone database");
        TaskUtils.dbShellExec("DROP DATABASE IF EXISTS " + database, dbShellString, database, function(err) {
            if (err) { throw new Error(err); }
            console.log("DROP OK");
            complete();
        });
    }, true);

    desc('Создание базы данных');
    task('init', [], function() {
        console.log("Creating standalone database");
        TaskUtils.dbShellExec("CREATE DATABASE " + database, dbShellString, database, function(err) {
            if (err) { throw new Error(err); }
            console.log("INIT OK");
            complete();
        });
    }, true);

    namespace('migrate', function() {
        desc('Создание новой миграции - db:standalone:migrate:create[name]');
        task('create', [], function(name) {
            console.log("Creating standalone database migration; name: %s; path: %s", name, migratorConfig.directory);
            Server.loadStandaloneKnex(config).migrate.make(name, migratorConfig)
            .then(function(result) {
                console.log("MIGRATION CREATED: %s", result);
                complete();
            }).catch(function(err) {
                throw new Error(err);
            });
        }, true);

        desc('Откат последней группы миграций');
        task('rollback', [], function(name) {
            console.log("Rolling back standalone database migration");
            Server.loadStandaloneKnex(config).transaction(function(t) {
                return t.migrate.rollback(migratorConfig);
            }).then(function(result) {
                console.log("ROLLBACK OK");
                complete();
            }).catch(function(err) {
                throw new Error(err);
            });
        }, true);
    });

    desc('Запуск миграций баз данных');
    task('migrate', [], function() {
        console.log("Migrating standalone database");
        Server.loadStandaloneKnex(config).transaction(function(trx) {
            return trx.migrate.latest(migratorConfig);
        }).then(function(err) {
            console.log("MIGRATE OK");
            complete();
        }).catch(function(err) {
            throw new Error(err);
        });
    }, true);

    desc('Пересоздание баз данных');
    task('recreate', ['drop', 'init', 'migrate']);
});
