var _ = require('lodash');
var path = require('path');
var clone = require('node-v8-clone').clone;
var utils = require('./utils');

var migrationFolderPath = path.join(process.env.SERVER_PATH, 'migrations/state');

var MigrationManager = module.exports = function(core, migrations) {
    this.core = core;
    this.logger = core.logger;
    this.updateMigrations(migrations);
};

MigrationManager.loadMigrations = function() {
    var migrationFiles = utils.requireDir(migrationFolderPath, {recursive: false});
    return _.map(migrationFiles, function(migration, filename) {
        return migration;
    }, {});
};

MigrationManager.prototype.updateMigrations = function(migrations) {
    this.migrations = migrations.sort(function(a, b) {
        return a.version - b.version;
    });
    this.migrationIndexes = this.migrations.reduce(function(memo, migration, index) {
        memo[migration.version] = index;
        return memo;
    }, {});
    this.latestMigration = this.migrations.length ? this.migrations[this.migrations.length - 1].version : 0;
};

MigrationManager.prototype.migrationIndexByVersion = function(version) {
    if (version === 0) {
        return -1;
    } else {
        if (this.migrationIndexes.hasOwnProperty(version)) {
            return this.migrationIndexes[version];
        } else {
            throw new Error("Unexisting migration version " + version);
        }
    }
};

MigrationManager.prototype.migrate = function(userId, state, fromVersion, toVersion) {
    var fromVersionIndex = this.migrationIndexByVersion(fromVersion);
    var toVersionIndex = this.migrationIndexByVersion((toVersion === null || toVersion === undefined) ? this.latestMigration : toVersion);

    if (fromVersionIndex > toVersionIndex) {
        throw new Error("Incorrect migration relation: fromVersion " + fromVersion + " > toVersion " + toVersion);
    }

    if (fromVersionIndex === toVersionIndex) {
        return state;
    }

    var result = clone(state, true);

    for (var i = fromVersionIndex + 1; i <= toVersionIndex; ++i) {
        var migration = this.migrations[i];
        this.logger.info("Migrating user " + userId + " to migration " +  migration.version + "_" + migration.name);
        result = migration.migrateState(result, this.logger);
    }

    return result;
};
