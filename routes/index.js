
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', t: req});
  // console.log(req.param('majlis') + req.param('fromDate') + req.param('toDate'));
  res.send(400)
};