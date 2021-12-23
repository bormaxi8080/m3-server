var GoogleSpreadsheet = require("google-spreadsheet");

var localeSheet = new GoogleSpreadsheet("1xpI6bpkUBfACblmUOgXw9l10ePiZ71zOWeJgvdDf5YA");

localeSheet.getRows(0, function(err, rowData) {
    console.log(err);
    console.log(rowData);

    //console.log( 'pulled in ' + rowData.length + ' rows ')
});

// localeSheet.getInfo( function(err, ss_info){
//     if (err) console.log( err );

//     // console.log( ss_info.title + ' is loaded' );

//     // // you can use the worksheet objects to add or read rows
//     // ss_info.worksheets[0].getRows( function(err, rows){
//     //     console.log( ss_info.worksheets[0].title + ' has '+rows.length + 'rows' );
//     // });
// });

