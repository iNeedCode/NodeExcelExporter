
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index');
};


exports.getAllSections = function(req, res) {

  var mysql     = require('mysql');
  var dbConfig = require('../config/db')
  var data = []

  var connection = mysql.createConnection({
    host    : dbConfig.host,
    user    : dbConfig.user,
    password  : dbConfig.password,
    database  : dbConfig.database
  });

  connection.connect();

  var q = "(SELECT id, MAJLISNAME AS value, 'Majlis' AS section FROM tbl_eit_res_majlis) UNION (SELECT id, REGIONNAME AS value, 'Region' AS section FROM tbl_eit_res_region) UNION (SELECT id, ZONENAME AS value, 'Zone' AS section FROM tbl_eit_res_zone) ORDER BY section DESC";

  connection.query(q, function(err, rows, fields) {
    if (err) throw err;
    for (var i = rows.length - 1; i >= 0; i--) {
      data.push(rows[i]);
      // console.log(rows[i]);
    };

  res.send(data);    
  });

  connection.end();

};