var _ = require('lodash');
var path = require('path');
var helper = require('../helper');
var utils = helper.require('utils');
var localeUtils = helper.require('locale/localeUtils');

var DataWrapper = helper.require('game/dataWrapper');
var server = require('../lib/server').byId('local');

var DefManager = helper.require('defs/defManager.js');

describe('/defs', function() {
    before(function() {
        var user = server.generateUser({init: true});
        var defs = DefManager.loadStaticDefs();
        defs.readonly = false;
        localeUtils.iterateKeys(defs.raw, null, function(path, key) {
            defs.set(path, key);
        });
        this.defs = defs.raw;
        this.result = user.defs();

    });

    it('returns object with valid defs with expanded localize keys', function() {
        this.defs.should.deep.equal(_.omit(this.result, 'map', 'mapscreen', 'locales'));
    });
});
