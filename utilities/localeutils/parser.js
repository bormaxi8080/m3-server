var fs = require('fs');
var DataWrapper = require('../server/lib/game/dataWrapper');

var tags = fs.readFileSync('tags.txt').toString().split('\n');
tags.pop();

var data = new DataWrapper({});

tags.forEach(function(tag) {
    data.set(tag, "*");
});

console.log(JSON.stringify(data.raw.client.interface, null, 4));
