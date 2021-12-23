var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var utils = require('../lib/utils');

var DefManager = require('../lib/defs/defManager.js');
var LocaleUtils = require('../lib/locale/localeUtils');
var p = console.log;

namespace('locale', function() {
    desc('Поиск непереведенных фраз в дефах и добавление их в файлы переводов.');
    task('update', [], function() {
        var notifyEmptyKeys = (process.env.EMPTY !== 'false');
        var localePath = path.join(__dirname, '../locale');
        var locales = utils.requireDir(localePath);
        var groups = utils.requireDir(path.join(__dirname, '../groups'));

        var defs = DefManager.loadStaticDefs();
        var staticDefKeys = LocaleUtils.collectKeys(defs.raw);
        var groupDefKeys = _.map(groups, function(changes) {
            return _.reduce(changes, function(memo, value, key) {
                return memo.concat(LocaleUtils.collectKeys(value, key));
            }, []);
        })
        var allDefKeys = _.uniq(staticDefKeys.concat.apply(staticDefKeys, groupDefKeys));
        p("Defs parsed");

        _.each(locales, function(locale, name) {
            var localeFileName = path.join(localePath, name +'.json');
            var localeKeys = Object.keys(locale);
            var allKeys = _.union(Object.keys(locale), allDefKeys).sort();

            var target = {};
            var statistics = {
                newKeys: [],
                unusedKeys: [],
                emptyKeys: []
            };

            allKeys.forEach(function(key) {
                if (locale.hasOwnProperty(key)) {
                    if (allDefKeys.indexOf(key) < 0) {
                        statistics.unusedKeys.push(key);
                    }
                    if (notifyEmptyKeys && locale[key] === null) {
                        statistics.emptyKeys.push(key);
                    }
                    target[key] = locale[key];
                } else {
                    statistics.newKeys.push(key);
                    target[key] = null;
                }
            });

            var hasChanges = false;
            p("Locale %s parsed", name);
            if (statistics.newKeys.length) {
                p("  New keys found in defs:")
                p("    " + statistics.newKeys.join("\n    "));
                var hasChanges = true;
            }
            if (statistics.emptyKeys.length) {
                p("  Empty keys found in defs:")
                p("    " + statistics.emptyKeys.join("\n    "));
            }
            if (statistics.unusedKeys.length) {
                p("  Unused keys found in localization file %s:", localeFileName)
                p("    " + statistics.unusedKeys.join("\n    "));
            }
            if (hasChanges) {
                fs.writeFileSync(localeFileName, JSON.stringify(target, null, 4));
            }
        });
    });
});
