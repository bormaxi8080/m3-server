var _ = require('lodash');
var p = console.log;

var Reporter = function(concurrency) {
    this.requests = {};
    this.concurrency = concurrency || 1;
};

Reporter.prototype.start = function() {
    this.tasksCompleted = 0;
    this.startTime = Date.now();
    this.totalTime = 0;
};

Reporter.prototype.stop = function() {
    this.totalTime = Date.now() - this.startTime;
};

Reporter.prototype.finish = function() {
    if (++this.tasksCompleted == this.concurrency) {
        this.stop();
        this.printRequestsStats();
    }
};

Reporter.prototype.measure = function(url, fn) {
    var start = Date.now();
    fn();
    var ms = Date.now() - start;
    this.requests[url] = this.requests[url] || [];
    this.requests[url].push(ms);
};

Reporter.prototype.printRequestsStats = function() {
    function timeSpreading(msArray) {
        var spreading = {};
        var msSorted = msArray.sort(function(a, b) {
            return a - b;
        });

        function sliceTime(part) {
            var head = _.first(msSorted, Math.floor(part * msSorted.length));
            if (_.isEmpty(head)) {
                return [0, 0];
            } else {
                return [_.max(head), head.length];
            }
        }

        _.each([10, 25, 50, 75, 90, 95, 99], function(num) {
            var slice = sliceTime(num / 100);
            spreading[num + '%'] = slice[0] + ' ms, ' + slice[1] + ' reqs';
        });
        spreading['100%'] = _.max(msSorted) + ' ms (longest request)';
        return spreading;
    }

    var totalRequests = _.reduce(this.requests, function(memo, msArray) {
        return memo += msArray.length;
    }, 0);

    var totalInRequestTime = 0;
    _.each(this.requests, function(msArray) {
        _.each(msArray, function(ms) { totalInRequestTime += ms; });
    });

    var totalAvgTime = (totalInRequestTime / totalRequests).toFixed(2);
    var totalAvgTimeConcurrent = (this.totalTime / totalRequests).toFixed(2);
    var totalReqPerSec = (1000 / totalAvgTime).toFixed(2);
    var totalReqPerSecConcurrent = (1000 / totalAvgTimeConcurrent).toFixed(2);

    p('');
    p('Completed requests:        %d', totalRequests);
    p('Requests per second:       %d (across all requests)', totalReqPerSec);
    p('Requests per second:       %d (across all requests, concurrently)', totalReqPerSecConcurrent);
    p('Total time taken:          %d s', (this.totalTime / 1000).toFixed(2));
    p('Average request time:      %d ms (across all requests)', totalAvgTime);

    p('Completed requests by type:');
    _.each(this.requests, function(msArray, name) {
        var reqTotalTime = _.reduce(msArray, function(result, ms) {
            return result + ms;
        }, 0);
        var avgTime = (reqTotalTime / msArray.length).toFixed(2);
        var reqPerSec = (1000 / avgTime).toFixed(2);
        var minReq = _.min(msArray);
        var maxReq = _.max(msArray);

        p('\n' + name);
        p('  Requests completed:      %d', msArray.length);
        p('  Requests per second:     %d', reqPerSec);
        p('  Average request time:    %d ms', avgTime);
        p('  Minimum request time:    %d ms', minReq);
        p('  Maximum request time:    %d ms', maxReq);

        p('  Request spreading by time:');
        var spreading = timeSpreading(msArray);
        _.each(spreading, function(data, name) {
            p('    %s: %s', name, data);
        });
    });
};

module.exports = Reporter;
