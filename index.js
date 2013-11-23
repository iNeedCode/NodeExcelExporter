var dbConfig		= require('./dbConfig.json')
var heredoc 		= require('heredoc');
var argv				= require('optimist').argv;
var mysql			= require('mysql');
var spreadsheet 	= require('node_spreadsheet');

var inMajlis 	= (typeof argv.majlis === "undefined") ? "'dortmund'" : "'"+argv.majlis+"'";
var inFrom 		= (typeof argv.from === "undefined") ? '08-2013' : argv.from;
var inTo 		= (typeof argv.to === "undefined") ? '09-2013' : argv.to;
// console.log(inMajlis + " ==> " + inFrom + " - " + inTo);

var outFile = __dirname + '/' + generateFilename(inFrom, inTo, inMajlis);
var connection = mysql.createConnection({
	host		: dbConfig.host,
	user		: dbConfig.user,
	password	: dbConfig.password,
	database	: dbConfig.database
});
connection.connect();

var inFromMonth 	= toMonth(inFrom);
var inFromYear		= toYear(inFrom)
var inToMonth 		= toMonth(inTo);
var inToYear 		= toYear(inTo);
// console.log	(inFromMonth+"/"+inFromYear+"-"+inToMonth+"/"+inToYear);


var data = [];
data.push = function (id, value) {
    if (!this[id]) {
        this[id] = [];
    }
    this[id].push(value);
}

// Header information for Excel data array
data.push(0, 'Majlis:,' + inMajlis.replace(/\'/g, '') );
data.push(1,"Zeitraum:," + inFrom + ', bis,' + inTo);
data.push(2,"");
data.push(3,"NO,QUESTION");
for (var i = inFromMonth; i <= inToMonth; i++) {
	data.push(3,i+". MONTH")
};


var query = heredoc(function () {/*
SELECT tbl_report.YEAR, tbl_report.MONTH, tbl_question.ID, tbl_question.QUESTION , tbl_answer.ANSWER, tbl_question.TYPEID
FROM tbl_ait_rpt_reportanswer AS tbl_answer
	JOIN tbl_ait_rpt_reportquestion AS tbl_question
		ON tbl_answer.QUESTIONID = tbl_question.ID
	JOIN tbl_ait_rpt_reportheader AS tbl_report
		ON tbl_answer.REPORTID = tbl_report.ID
WHERE tbl_report.MAJLISID = -MAJLIS- AND tbl_report.YEAR >= -inFromYear- AND tbl_report.YEAR <= -inToYear- AND tbl_report.MONTH >= -inFromMonth- AND tbl_report.MONTH <= -inToMonth-
ORDER BY tbl_report.YEAR ASC, tbl_report.MONTH ASC
    */});

// replacing the data with the user input
query = query.replace(/-MAJLIS-/g, inMajlis),
query = query.replace(/-inFromYear-/g, inFromYear);
query = query.replace(/-inToYear-/g, inToYear);
query = query.replace(/-inFromMonth-/g, inFromMonth);
query = query.replace(/-inToMonth-/g, inToMonth);
// console.log(query);


connection.query(query, function(err, rows, fields) {
	if (err) throw err;
		var rowsLentgh = rows.length;
		mod = 98 // number of questions of one report
		
		for (var i = 0; i < rowsLentgh; i++) {
			if (i < mod) {
				// data.push(i%mod+4, rows[i].ID);
				data.push(i%mod+4, i+1);
				data.push(i%mod+4, rows[i].QUESTION.replace(/[\,\n]/g, " "));				
			};

			if (rows[i].TYPEID == "4") {
				data.push(i%mod+4, (rows[i].ANSWER == '1') ? "Ja" : "Nein");
			}
			else {
				data.push(i%mod+4,rows[i].ANSWER);
			}
		};

		// console.log(data);
		spreadsheet.write(data, outFile,function(err, fileName) {
    		if(!err) console.log(fileName);
		});
});


connection.end();

// ---------------------------------
// FUNCTIONS
// ---------------------------------

function toMonth (_date) {
	month = _date.match(/^../g);
	return parseInt(month);
}

function toYear (_date) {
	year = _date.match(/....$/g);
	return parseInt(year);
}

function generateFilename (inFrom, inTo, inMonth) {
	return inFrom + "-" + inTo + "-" + inMajlis.replace(/\'/g, '') + ".xls";
}