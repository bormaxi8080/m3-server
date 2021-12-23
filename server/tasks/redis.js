var Server = require('../lib/server');

namespace('redis', function() {
    desc('Сброс состояния redis');
    task('flush', [], function() {
        var config = Server.loadConfig(process.env.CONFIG_PATH);
        var client = Server.loadRedis(config);
        console.log("Flushing redis");
        client.flushall(function(err, result) {
            if (err) { throw new Error(err); }
            client.end();

            complete();
        });
    }, true);
});
