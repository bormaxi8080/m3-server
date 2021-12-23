namespace('db', function() {
    require('./db/shardable');
    require('./db/standalone');

    desc('Пересоздание всех баз данных');
    task('recreate', ['shardable:recreate', 'standalone:recreate']);

    desc('Миграция всех баз данных');
    task('migrate', ['shardable:migrate', 'standalone:migrate']);
});
