var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var domain = require('domain');

var app = module.exports = express();

var loadYaml = function(path) {
    return yaml.safeLoad(fs.readFileSync(fs.realpathSync(path), 'utf8'));
};

var config = loadYaml(path.join(__dirname, "config", app.settings.env + ".yml"));

app.set('config', config);
app.set('db', require('./lib/db')(config.db));

app.use(function(req, res, next) {
    var d = domain.create();
    d.on('error', function(err) {
        console.log('DOMAIN ERROR:');
        console.log(err.stack);
        res.json(500, {error: "internal error"});
    });

    d.add(req);
    d.add(res);

    d.run(function() {
        next();
    });
});

app.use(methodOverride('_method'));
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var AuthorizeController = require('./app/controllers/authorize');
app.post('/login', AuthorizeController.login);
app.post('/logout', AuthorizeController.logout);

app.use('/users', require('./app/controllers/users').router);

app.use('/levels', require('./app/controllers/levels').router);
app.use('/chapters', require('./app/controllers/chapters').router);

app.use('/export', require('./app/controllers/export').router);
app.use('/import', require('./app/controllers/import').router);

app.run = function() {
    var port = process.env.PORT || config.port;
    app.listen(port, function() {
        console.log("Server listening on port " + port);
    });
};

app.use('/assets', express.static(path.normalize(path.join(__dirname, '../editor/assets'))));
app.use(express.static(path.normalize(path.join(__dirname, 'public'))));

app.run();
