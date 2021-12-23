var request = require('request');
var Future = require('fibers/future');

var syncRequest = module.exports = function(method, requestUrl, body) {
    var future = new Future();

    var headers = {};
    if (typeof body === 'object') {
        body = JSON.stringify(body);
        headers['content-type'] = 'application/json';
    }

    request[method]({
        headers: headers,
        url:     requestUrl,
        body:    body
    }, function(err, resp, data) {
        if (err) { throw new Error(err); }
        if (resp.headers['content-type'].indexOf('application/json') >= 0) {
            future.return(JSON.parse(data));
        } else {
            future.return(data);
        }
    });

    return future.wait();
};
