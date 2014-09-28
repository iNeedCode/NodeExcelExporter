var dbConfig		= require('./config/db.json')
var heredoc 		= require('heredoc');
var argv				= require('optimist').argv;
var mysql			= require('mysql');
var spreadsheet 	= require('node_spreadsheet');

var inMajlis 	= "'"+argv.majlis+"'";
var inZone		= "'"+argv.zone+"'";
var inRegion	= "'"+argv.region+"'";
var inFrom 		= argv.from;
var inTo 		= argv.to;
// console.log(inMajlis + " ==> " + inFrom + " - " + inTo);

var outFile = __dirname + '/';
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

validate(); // validate user input

var data = [];
data.push = function (id, value) {
    if (!this[id]) {
        this[id] = [];
    }
    this[id].push(value);
}


setSectionName();
data.push(1,"Zeitraum:," + inFrom + ', bis,' + inTo);
data.push(2,"");
data.push(3,"NO,QUESTION");

if (inMajlis != "'undefined'") {
	includedMajalis = [];
	includedMajalis.push(inMajlis.replace(/\'/g, ''));
	queryBuilderMajlis(inFromMonth, inFromYear, inToMonth, inToYear, includedMajalis, function(query){
		// console.log(query);
		connection.query(query, function(err, rows, fields) {
		if (err) throw err;
			var rowsLentgh = rows.length;
			mod = 96 // number of questions of one report

			for (var i = 0; i < rowsLentgh; i++) {
				
				if (i%mod == 0) {
					data.push(3, rows[i].MONTH+"/"+inToYear);
				};

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
	});
}
else if (inZone != "'undefined'" || inRegion != "'undefined'" && inRegion != "'all'") {
	for (var i = inFromMonth; i <= inToMonth; i++) {
		data.push(3,i+"/"+inFromYear)
	};
	getAllMajalisFromZoneOrRegion(function(includedMajalis) {
		// console.log(includedMajalis);
		queryBuilderMajlisGroupBy(inFromMonth, inFromYear, inToMonth, inToYear, includedMajalis, function(query){
			// console.log(query);
			data.push(2, "received reports")
			connection.query(query, function(err, rows, fields) {
				if (err) throw err;
				var rowsLentgh = rows.length;
				mod = 96 // number of questions of one report
				
				for (var i = 0; i < rowsLentgh; i++) {
					if (i%mod == 1) {
						data.push(2, rows[i].REPORTS+"/"+includedMajalis.length)
					};
					if (i < mod) {
						data.push(i%mod+4, i+1);
						data.push(i%mod+4, rows[i].QUESTION.replace(/[\,\n]/g, " "));				
					};

					if (rows[i].TYPEID == "4") {
						data.push(i%mod+4, rows[i].ANSWER + "/" + rows[i].REPORTS);
					}
					else {
						data.push(i%mod+4,rows[i].ANSWER);
					};
				};

				// console.log(data);
				spreadsheet.write(data, outFile,function(err, fileName) {
					if(!err) console.log(fileName);
				});
			});
		connection.end();
		});
	});
}
else{
	for (var i = inFromMonth; i <= inToMonth; i++) {
		data.push(3,i+"/"+inFromYear)
	};
	getAllMajalis(function(includedMajalis) {
		queryBuilderMajlisGroupBy(inFromMonth, inFromYear, inToMonth, inToYear, includedMajalis, function(query){
			// console.log(query);
			data.push(2, "received reports")
			connection.query(query, function(err, rows, fields) {
				if (err) throw err;
				var rowsLentgh = rows.length;
				mod = 96 // number of questions of one report
				
				for (var i = 0; i < rowsLentgh; i++) {
					if (i%mod == 1) {
						data.push(2, rows[i].REPORTS+"/"+includedMajalis.length)
					};
					if (i < mod) {
						data.push(i%mod+4, i+1);
						data.push(i%mod+4, rows[i].QUESTION.replace(/[\,\n]/g, " "));				
					};

					if (rows[i].TYPEID == "4") {
						data.push(i%mod+4, rows[i].ANSWER + "/" + rows[i].REPORTS);
					}
					else {
						data.push(i%mod+4,rows[i].ANSWER);
					};
				};

				// console.log(data);
				spreadsheet.write(data, outFile,function(err, fileName) {
					if(!err) console.log(fileName);
				});
			});
		connection.end();
		});
	});
};


// ---------------------------------
// FUNCTIONS
// ---------------------------------
function getAllMajalis (callback) {
	var includedMajalis = new Array();
	q = heredoc(function(){/*
		SELECT majlis.MajlisId
		FROM majlis
	*/});
	// console.log(q);
	
	connection.query(q, function(err, rows, fields) {
	if (err) throw err;
		var rowsLentgh = rows.length;
		for (var i = 0; i < rowsLentgh; i++) {
			includedMajalis.unshift(rows[i].MajlisId);
		};
		callback(includedMajalis)
	});
}

function getAllMajalisFromZoneOrRegion (callback) {
	var includedMajalis = new Array();
	q = heredoc(function(){/*
		SELECT majlis.MajlisId
		FROM majlis
		WHERE majlis.ZoneId = -ZONE- OR majlis.RegionId = -REGION-
	*/});
	q = q.replace(/-ZONE-/g, inZone);
	q = q.replace(/-REGION-/g, inRegion);
	// console.log(q);
	
	connection.query(q, function(err, rows, fields) {
	if (err) throw err;
		var rowsLentgh = rows.length;
		for (var i = 0; i < rowsLentgh; i++) {
			includedMajalis.unshift(rows[i].MajlisId);
		};
		callback(includedMajalis)
	});
}

function queryBuilderMajlis (startingMonth, startingYear, endingMonth, endingYear, includedMajalis, callback) {
	q = heredoc(function () {/*
	SELECT tbl_report.YEAR, tbl_report.MONTH, tbl_question.ID, tbl_question.QUESTION , tbl_answer.ANSWER, tbl_question.TYPEID
	FROM tbl_ait_rpt_reportanswer AS tbl_answer
		JOIN tbl_ait_rpt_reportquestion AS tbl_question
			ON tbl_answer.QUESTIONID = tbl_question.ID
		JOIN tbl_ait_rpt_reportheader AS tbl_report
			ON tbl_answer.REPORTID = tbl_report.ID
	WHERE (tbl_report.MAJLISID = -MAJLIS-) AND tbl_report.YEAR >= -inFromYear- AND tbl_report.YEAR <= -inToYear- AND tbl_report.MONTH >= -inFromMonth- AND tbl_report.MONTH <= -inToMonth-
	ORDER BY tbl_report.YEAR ASC, tbl_report.MONTH ASC, tbl_question.ID ASC
	    */});

	// replacing the data with the user input
	if (includedMajalis.length == 1) {
		q = q.replace(/-MAJLIS-/g, "'" + includedMajalis + "'");
	}
	else{
		for (var i = includedMajalis.length - 1; i >= 0; i--) {
			if (i == includedMajalis.length - 1) {
				q = q.replace(/-MAJLIS-/g, "'" + includedMajalis[i] + "' -MAJLIS-");
			}
			else if (i != 0) {
				q = q.replace(/-MAJLIS-/g, "OR tbl_report.MAJLISID = '" + includedMajalis[i] + "' -MAJLIS-");
			}
			else {
				q = q.replace(/-MAJLIS-/g, "OR tbl_report.MAJLISID = '" + includedMajalis[i] + "'");
			};
		};
	};
	q = q.replace(/-inFromYear-/g, startingYear);
	q = q.replace(/-inToYear-/g, endingYear);
	q = q.replace(/-inFromMonth-/g, startingMonth);
	q = q.replace(/-inToMonth-/g, endingMonth);
	// console.log(q);
	callback(q);
}

function queryBuilderMajlisGroupBy (startingMonth, startingYear, endingMonth, endingYear, includedMajalis, callback) {
	q = heredoc(function () {/*
	SELECT tbl_report.YEAR, tbl_report.MONTH, tbl_question.ID, tbl_question.QUESTION , COUNT(*) AS REPORTS, SUM(tbl_answer.ANSWER) AS ANSWER, tbl_question.TYPEID
	FROM tbl_ait_rpt_reportanswer AS tbl_answer
		JOIN tbl_ait_rpt_reportquestion AS tbl_question
			ON tbl_answer.QUESTIONID = tbl_question.ID
		JOIN tbl_ait_rpt_reportheader AS tbl_report
			ON tbl_answer.REPORTID = tbl_report.ID
	WHERE (tbl_report.MAJLISID = -MAJLIS-) AND tbl_report.YEAR >= -inFromYear- AND tbl_report.YEAR <= -inToYear- AND tbl_report.MONTH >= -inFromMonth- AND tbl_report.MONTH <= -inToMonth-
	GROUP BY tbl_report.YEAR, tbl_report.MONTH, tbl_question.ID
	ORDER BY tbl_report.YEAR ASC, tbl_report.MONTH ASC, tbl_question.ID ASC
	    */});

	// replacing the data with the user input
	if (includedMajalis.length == 1) {
		q = q.replace(/-MAJLIS-/g, "'" + includedMajalis + "'");
	}
	else{
		for (var i = includedMajalis.length - 1; i >= 0; i--) {
			if (i == includedMajalis.length - 1) {
				q = q.replace(/-MAJLIS-/g, "'" + includedMajalis[i] + "' -MAJLIS-");
			}
			else if (i != 0) {
				q = q.replace(/-MAJLIS-/g, "OR tbl_report.MAJLISID = '" + includedMajalis[i] + "' -MAJLIS-");
			}
			else {
				q = q.replace(/-MAJLIS-/g, "OR tbl_report.MAJLISID = '" + includedMajalis[i] + "'");
			};
		};
	};
	q = q.replace(/-inFromYear-/g, startingYear);
	q = q.replace(/-inToYear-/g, endingYear);
	q = q.replace(/-inFromMonth-/g, startingMonth);
	q = q.replace(/-inToMonth-/g, endingMonth);
	// console.log(q);
	callback(q);
}

function validate () {
	errorMessage = '';

	if (inMajlis == "'undefined'" && inZone == "'undefined'" && inRegion == "'undefined'") {
		errorMessage += "majlis, zone, or region is not defined\n";
	};
	if (inFromYear > inToYear) {
		errorMessage += "Starting year is greater then ending year\n";
	};
	if (inFromYear == inToYear && inFromMonth > inToMonth) {
		errorMessage += "Starting month is greater then ending month\n";
	};
	if (inFromMonth < 1 && inFromMonth > 12 && inToMonth < 1 && inToMonth > 12) {
		errorMessage += "months can be only betweeen 1 and 12";
	};

	if (errorMessage != '') {
		console.log(errorMessage);
		process.exit(1);
	};
}

function setSectionName () {
	// Header information for Excel data array
	if (inMajlis != "'undefined'") {
		data.push(0, 'Majlis:,' + inMajlis.replace(/\'/g, '') );	
		outFile += "M-" + generateFilename(inFrom, inTo, inMajlis)
	}
	else if (inZone != "'undefined'") {
		data.push(0, 'Zone:,' + inZone.replace(/\'/g, '') );
		outFile += "Z-" + generateFilename(inFrom, inTo, inZone)
	}
	else if (inRegion != "'undefined'") {
		data.push(0, 'Region:,' + inRegion.replace(/\'/g, '') );
		outFile += "R-" + generateFilename(inFrom, inTo, inRegion)
	}
	else {
		data.push(0, 'National:');
	};	
}

function toMonth (_date) {
	month = _date.match(/^../g);
	return parseInt(month);
}

function toYear (_date) {
	year = _date.match(/....$/g);
	return parseInt(year);
}

function generateFilename (inFrom, inTo, inSection) {
	return inSection.replace(/\'/g, '') + "-" + inFrom + "-" + inTo + ".xls";
}