var url = require('url');
var http = require('http');
var Future = require('fibers/future');

var syncRequest = module.exports = function(method, requestUrl, body) {
    var future = new Future();

    var headers = {};
    if (typeof body === 'object') {
        body = JSON.stringify(body);
        headers['content-type'] = 'application/json';
    }

    var parsedUrl = url.parse(requestUrl);
    var options = {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: method,
        headers: headers,
        agent: false,
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var data = "";

        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            future.return(data);
        });
    });

    req.on('error', function(err) {
        if (err) { throw new Error(err); }
    });

    if (body) {
        req.write(body + '\n');
    };

    req.end();

    return future.wait();
};
