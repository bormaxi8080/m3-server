var _ = require('lodash');
var path = require('path');
var helper = require('../helper');
var utils = require('../../../lib/utils');
var server = require('../lib/server').byId('local');

describe('get languages from server', function() {
    it('languages from server should be equal languages from file', function() {
        var locales = utils.requireDir(path.join(__dirname, '../../../locale'));
        _.each(locales, function(phrases, locale) {
            var result = server.getRequest('/locale?code=' + locale, {});
            result.should.be.deep.equal(phrases);
        });
    });
});
