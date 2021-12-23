var _ = require('lodash');

var fs = require('fs');
var uuid = require('node-uuid');
var path = require('path');
var async = require('async');

var TaskUtils = require('../taskUtils');
var Server = require('../../lib/server');

var config = Server.loadConfig(process.env.CONFIG_PATH);

var shardShellConnections = function(dbConfig) {
    return _.reduce(dbConfig.shards, function(result, shard, shardId) {
        var db = dbConfig.db[shard.db_cfg];
        result.push({
            shard: shardId,
            db: shard.db,
            connString: TaskUtils.dbShellString(db)
        });
        return result;
    }, []);
};

namespace('shardable', function() {
    var migratorConfig = {
        directory: path.join(process.env.SERVER_PATH, 'migrations/shardable')
    };

    desc('Удаление баз данных');
    task('drop', [], function() {
        console.log("Dropping shardable database");
        async.eachSeries(shardShellConnections(config.db.shardable), function(conn, callback) {
            TaskUtils.dbShellExec("DROP DATABASE IF EXISTS " + conn.db, conn.connString, conn.db, callback);
        }, function(err) {
            if (err) { throw new Error(err); }
            console.log("DROP OK");
            complete();
        });
    }, true);

    desc('Создание баз данных');
    task('init', [], function() {
        console.log("Creating shardable database");
        async.eachSeries(shardShellConnections(config.db.shardable), function(conn, callback) {
            TaskUtils.dbShellExec("CREATE DATABASE " + conn.db, conn.connString, conn.db, callback);
        }, function(err) {
            if (err) { throw new Error(err); }
            console.log("INIT OK");
            complete();
        });
    }, true);

    namespace('migrate', function() {
        desc('Создание новой миграции - db:shardable:migrate:create[name]');
        task('create', [], function(name) {
            console.log("Creating shardable database migration; name: %s; path: %s", name, migratorConfig.directory);
            Server.loadMultiKnex(config).using(0).migrate.make(name, migratorConfig).exec(function(err, result) {
                if (err) { throw new Error(err); }
                console.log("MIGRATION CREATED: %s", result);
                complete();
            });
        }, true);

        desc('Откат последней группы миграций');
        task('rollback', [], function(name) {
            console.log("Rolling back shardable database migration");
            Server.loadMultiKnex(config).transactionalExec(function(knex, callback) {
                knex.migrate.rollback(migratorConfig).exec(callback);
            }, function(err, results) {
                if (err) { throw new Error(err); }
                console.log("ROLLBACK OK");
                complete();
            });
        }, true);
    });

    desc('Запуск миграций баз данных');
    task('migrate', [], function() {
        console.log("Migrating shardable database");
        Server.loadMultiKnex(config).transactionalExec(function(knex, callback) {
            knex.migrate.latest(migratorConfig).exec(callback);
        }, function(err, results) {
            if (err) { throw new Error(err); }
            console.log("MIGRATE OK");
            complete();
        });
    }, true);

    desc('Пересоздание баз данных');
    task('recreate', ['drop', 'init', 'migrate']);
});
