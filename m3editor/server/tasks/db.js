var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var yaml = require('js-yaml');

var loadYaml = function(path) {
    return yaml.safeLoad(fs.readFileSync(fs.realpathSync(path), 'utf8'));
};

var configPath = path.join(__dirname, '../config', process.env.NODE_ENV + '.yml');
var config = loadYaml(configPath);

var shellConnection = function(db) {
    var connString = (db.password ? 'PGPASSWORD=' + db.password + ' ': '');
    connString += 'psql -U ' + db.user + ' -h ' + db.host + ' -p ' + db.port;
    return connString;
};

var echoCmd = function(cmd) {
    return 'echo "' + cmd + '"';
};

var execDBCmd = function(cmd, connString, callback) {
    var rawCmd = echoCmd(cmd) + " | " + connString;
    console.log("SQL: %s", cmd);
    exec(rawCmd, function(err, stdout, stderr) {
        callback(stderr.match("ERROR") ? stderr : null);
    });
};

namespace('db', function() {
    var migratorConfig = {
        directory: path.normalize(path.join(__dirname, '../migrations'))
    };
    var connString = shellConnection(config.db);

    desc('Удаление базы данных');
    task('drop', [], function() {
        console.log("Dropping database");
        execDBCmd("DROP DATABASE IF EXISTS " + config.db.database, connString, function(err) {
            if (err) { throw new Error(err); }
            complete();
        });
    }, true);

    desc('Создание базы данных');
    task('init', [], function() {
        console.log("Initing database");
        execDBCmd("CREATE DATABASE " + config.db.database, connString, function(err) {
            if (err) { throw new Error(err); }
            complete();
        });
    }, true);

    namespace('migrate', function() {
        desc('Создание новой миграции - db:migrate:create[name]');
        task('create', [], function(name) {
            console.log("Creating new migration");
            var knex = require('../lib/db')(config.db);
            console.log("CREATING MIGRATION; NAME: %s; PATH: %s", name, migratorConfig.directory);
            knex.migrate.make(name, migratorConfig).exec(function(err, result) {
                if (err) {
                    console.log("ERROR CREATING MIGRATION: %s", err);
                } else {
                    console.log("MIGRATION CREATED: %s", result);
                }
                complete();
            });
        }, true);

        desc('Откат последней группы миграций');
        task('rollback', [], function(name) {
            console.log("Rolling back database migration");
            var knex = require('../lib/db')(config.db);
            knex.transaction(function(t) {
                return t.migrate.rollback(migratorConfig);
            }).then(function(err) {
                console.log("MIGRATION UNDONE OK");
                complete();
            }).catch(function(err) {
                console.log("ROLLBACK; UNDOING MIGRATIONS ERR: %s", err);
                complete();
            });
        }, true);
    });

    desc('Запуск миграций баз данных');
    task('migrate', [], function() {
        console.log("Migrating database");
        var knex = require('../lib/db')(config.db);
        knex.transaction(function(trx) {
            return trx.migrate.latest(migratorConfig);
        }).then(function(err) {
            console.log("MIGRATION OK");
            complete();
        }).catch(function(err) {
            console.log("ROLLBACK; MIGRATION ERR: %s", err);
            complete();
        });
    }, true);

    desc('Пересоздание баз данных');
    task('recreate', ['drop', 'init', 'migrate']);

    namespace('user', function() {
        desc('Добавить юзера в базу данных jake db:user:add[name,password]');
        task('add', [], function(name, password) {
            var knex = require('../lib/db')(config.db);
            var User = require('../app/models/user');
            var time = new Date();
            var hash = User.hashPassword(time.toString(), password);
            knex('users')
            .insert({name: name, hash: hash, updated_at: time, created_at: time })
            .exec(function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("User " + name + " added");
                }
                complete();
            });
        }, true);

        desc('Обновить пароль юзера в базе данных jake db:user:update[name,password]');
        task('update', [], function(name, password) {
            var knex = require('../lib/db')(config.db);
            var User = require('../app/models/user');
            knex.transaction(function(trx) {
                trx('users')
                .select('id', 'created_at')
                .forUpdate()
                .where({name: name})
                .limit(1)
                .exec(function(err, users) {
                    if (err) { return trx.rollback(err); }
                    if (!users.length) { return trx.rollback("User not found"); }
                    var user = users[0];
                    var hash = User.hashPassword(user.created_at.toString(), password);

                    trx('users')
                    .update({hash: hash, updated_at: new Date()})
                    .where({id: user.id})
                    .exec(function(err, result) {
                        if (err) { return trx.rollback(err); }
                        trx.commit();
                    });
                });
            }).exec(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("User " + name + " password succesfully updated");
                }
                complete();
            });
        }, true);

        desc('Удалить пользователя из базы данных jake db:user:delete[name]');
        task('delete', [], function(name) {
            var knex = require('../lib/db')(config.db);
            knex('users')
            .delete()
            .where({name: name})
            .limit(1)
            .exec(function(err, users) {
             if (err) {
                    console.log(err);
                } else {
                    console.log("User " + name + " succesfully deleted");
                }
                complete();
            });
        }, true);
    });
});
