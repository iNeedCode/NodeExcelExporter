var nodeExcel = require('excel-export-impr');

exports.create = function(req, res) {
	console.log("HTTP REQUEST: " + req.originalMethod);
	console.log("HTTP QUERY: " + req.originalUrl);
  console.log(req.body.majlis + " => " + req.body.fromDate + " - " + req.body.toDate)
  // res.send("respond with a resources");
  // res.render('index', { title: 'Express'});

  var majlis = req.body.majlis
  var inFromMonth   = toMonth(req.body.fromDate);
  var inFromYear    = toYear(req.body.fromDate)
  var inToMonth     = toMonth(req.body.toDate);
  var inToYear    = toYear(req.body.toDate);  

  console.log(inFromMonth + "-" + inFromYear +"/"+inToMonth + "-" + inToYear)


var conf ={};
  conf.cols = [
	{caption:'Majlis', type:'string'},
	{caption: majlis, type:'string'},
	{caption:'', type:'string'},
	{caption:'', type:'string'},
  {caption:'', type:'string'},
  {caption:'', type:'string'},
  {caption:'', type:'string'}
  ];
  conf.rows = [
	[44, 44, 44, 44, 44, 44, 43],
	["e","e","e","e","e","e","e"]
  ];
  // console.log(conf);
  var result = nodeExcel.execute(conf);
  res.setHeader('Content-Type', 'application/msexcel');
  res.setHeader("Content-Disposition", "attachment; filename=" + majlis + ".xlsx");
  res.end(result, 'binary');



};


function toMonth (_date) {
  month = _date.match(/^../g);
  return parseInt(month);
}

function toYear (_date) {
  year = _date.match(/....$/g);
  return parseInt(year);
}