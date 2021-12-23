var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var DefManager = require('../lib/defs/defManager.js');

namespace('defs', function() {
    desc('Проверка дефов на соответствие схеме');
    task('validate', [], function() {
        var jsonsem = require('jsonsem');
        var defs = DefManager.loadStaticDefs();
        var validator = new jsonsem(require('../defs/schema'));
        if (!validator.validate(defs.raw)) {
            console.log("Defs errors encountered:");
            console.log(validator.errors);
            fail("Defs validation FAIL");
        } else {
            console.log("Defs validation OK");
        }
    });
});

