var fs = require('fs');
var DataWrapper = require('../server/lib/game/dataWrapper');

var tags = fs.readFileSync('tags.txt').toString().split('\n');
tags.pop();

var texts = fs.readFileSync('texts.txt').toString().split('\n');
texts.pop();

var locale = require('../server/locale/ru_RU.json');

tags.forEach(function(tag, index) {
    var text = tag;
    if (!locale.hasOwnProperty(text)) {
        console.log(text);
    } else {
        console.log("%s === %s", text, texts[index]);
        locale[text] = texts[index];
    }
});

fs.writeFileSync('../server/locale/ru_RU.json', JSON.stringify(locale, null, 4) + "\n");
