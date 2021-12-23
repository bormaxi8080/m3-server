var _ = require('lodash');

var fs = require('fs');
var path = require('path');
var program = require('commander');

var parse = require('csv-parse');

var CSV_PATH = path.resolve(path.resolve('./csv'));

var locale = require('../../server/locale/ru_RU.json');

var requireDir = function(dir, opts) {
    opts = _.defaults(opts || {}, {
        exts: ['.csv']
    });

    return _.filter(fs.readdirSync(dir), function(fileName) {
        return (opts.exts.indexOf(path.extname(fileName)) >= 0);
    });
};

var getMappedColumn = function(data, columnIndex) {
    return _.map(data, function(rowData) {
        return rowData[columnIndex];
    });
};

program
    .version('0.0.1')
    .usage('[options]')
    .option('-v, --verbose', 'Verbose output for parsed results')
    .parse(process.argv);

var importFiles = requireDir(CSV_PATH);

_.each(importFiles, function(fileName) {
    console.log('PARSING FILE ' + fileName + '...');
    var csv = fs.readFileSync('./csv/' + fileName).toString();

    parse(csv, {delimiter: ",", quote: '"', trim: true, skip_empty_lines: true, comment: "#"}, function(err, output){
        if (err) {
            console.log("ERROR PARSING FILE " + fileName + ": " + err);
        } else {
            console.log(output);

            var tags = getMappedColumn(output, 0);
            var texts = getMappedColumn(output, 3);

            tags.forEach(function(tag, index) {
                if (!locale.hasOwnProperty(tag)) {
                    if (program.verbose) {
                        console.log(tag);
                    }
                } else {
                    if (program.verbose) {
                        console.log("%s === %s", tag, texts[index]);
                    }
                    locale[tag] = texts[index];
                }
            });

            if (program.verbose) {
                console.log('OUTPUT:');
                console.log(locale);
            }

            fs.writeFileSync('../../server/locale/ru_RU.json', JSON.stringify(locale, null, 4) + "\n");

            console.log('PARSED');
        }
    });
});
