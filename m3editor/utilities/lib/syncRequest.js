var request = require('request');
var Future = require('fibers/future');
var querystring = require('querystring');

var syncRequest = module.exports = function(method, requestUrl, body) {
    var future = new Future();

    var headers = {};
    if (typeof body === 'object') {
        if (body.query) {
            requestUrl = requestUrl + '?' + querystring.stringify(body.query);
            delete body.query;
        }
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
    }

    request[method]({
        headers: headers,
        url:     requestUrl,
        body:    body
    }, function(err, resp, data) {
        if (err) { throw new Error(err); }
        future.return(data);
    });

    return future.wait();
};
