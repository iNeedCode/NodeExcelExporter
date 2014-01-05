var nodeExcel = require('excel-export-impr');

exports.create = function(req, res) {
	console.log("HTTP REQUEST: " + req.originalMethod);
	console.log("HTTP QUERY: " + req.originalUrl);
  console.log(req.body.majlis + " => " + req.body.fromDate + " - " + req.body.toDate)
  // res.send("respond with a resources");
  // res.render('index', { title: 'Express'});

  var majlis = req.body.majlis


var conf ={};
  conf.cols = [
	{caption:'string', type:'string'},
	{caption:'date', type:'date'},
	{caption:'bool', type:'bool'},
	{caption:'number', type:'number'},
  {caption:'link', type:'hyperlink'},
  {caption:'string', type:'string'}
  ];
  conf.rows = [
	['pi', (new Date(2013, 4, 1)).getJulian(), true, 3.14, { text: 'Google', href: 'http://www.google.com'}],
	["e", (new Date(2012, 4, 1)).getJulian(), false, 2.7182, { text: 'Google', href: 'http://www.google.com'}, '22', '22', '22', '22']
  ];
  // console.log(conf);
  var result = nodeExcel.execute(conf);
  res.setHeader('Content-Type', 'application/msexcel');
  res.setHeader("Content-Disposition", "attachment; filename=" + majlis + ".xlsx");
  res.end(result, 'binary');



};