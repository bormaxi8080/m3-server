var helper = require('../helper');
var MigrationManager = helper.require('migrationManager');

describe('MigrationManager', function() {
    beforeEach(function() {
        this.migration_first = {
            name: 'first',
            version: 20141024190000,
            migrateState: function(state) {
                state.a = 10;
                return state;
            }
        };

        this.migration_second = {
            name: 'second',
            version: 20141024200000,
            migrateState: function(state) {
                state.a = state.a * 10;
                return state;
            }
        };

        this.migration_third = {
            name: 'third',
            version: 20141024210000,
            migrateState: function(state) {
                state.b = state.a;
                delete state.a;
                return state;
            }
        };

        this.migrations = [
            this.migration_second,
            this.migration_first,
            this.migration_third
        ];

        this.manager = new MigrationManager(helper.dummyCore, this.migrations);
    });

    describe('#updateMigrations', function() {
        beforeEach(function() {
            this.manager.updateMigrations(this.migrations);
        });

        it('updates migrations with sorted migration array', function() {
            this.manager.migrations.should.deep.equal([
                this.migration_first,
                this.migration_second,
                this.migration_third
            ]);
        });

        it('updates migration indexes', function() {
            this.manager.migrationIndexes.should.deep.equal({
                "20141024190000": 0,
                "20141024200000": 1,
                "20141024210000": 2
            });
        });

        it('updates latest migration version', function() {
            this.manager.latestMigration.should.equal(20141024210000);
        });
    });

    describe('#migrationIndexByVersion', function() {
        it('returns index of existing version', function() {
            this.manager.migrationIndexByVersion(20141024200000).should.equal(1);
        });

        it('returns -1 for zero version', function() {
            this.manager.migrationIndexByVersion(0).should.equal(-1);
        });

        it('throws on unexisting version', function() {
            var self = this;
            (function() {
                self.manager.migrationIndexByVersion("unexisting_version");
            }).should.throw(Error);
        });
    });

    describe('#migrate', function() {
        it("migrates state to last version if no 'to' version passed", function() {
            this.manager.migrate(1, {}, 0).should.deep.equal({b: 100});
        });

        it("migrates state between given migrations", function() {
            this.manager.migrate(1, {a: 5}, 20141024190000, 20141024200000).should.deep.equal({a: 50});
        });

        it("throws when 'from' version greater than 'to' version", function() {
            var self = this;
            (function() {
                this.manager.migrate(1, {a: 5}, 20141024200000, 20141024190000);
            }).should.throw(Error);
        });
    });

});
