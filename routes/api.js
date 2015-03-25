var config = require('config');
var express = require('express');

var router = express.Router();

var publicAPI = require('../api').public;
var sendAPIResult = require('../lib/sendapiresult');
var doc = require('../api/doc.json');

router.get('/events', function (req, res) {
  res.status(400).type('text/plain').send('Bad Request');
});

router.get('/events/list.json', function (req, res) {
  var start_index = req.query.start_index;
  var count = req.query.count;
  sendAPIResult(publicAPI.events.list(start_index, count), res);
});

router.get('/events/:yyyy-:mm-:dd.json', function (req, res) {
  var yyyy = req.params.yyyy;
  var mm = req.params.mm;
  var dd = req.params.dd;
  var count = req.query.count;
  sendAPIResult(publicAPI.events.yyyymmdd(yyyy, mm, dd, count), res);
});

router.get('/events/search.json', function (req, res) {
  var q = req.query.q;
  var count = req.query.count;
  sendAPIResult(publicAPI.events.search(q, count), res);
});

router.get('/logs', function (req, res) {
  res.status(400).type('text/plain').send('Bad Request');
});

router.get('/logs/:about.json', function (req, res) {
  var about = req.params.about;
  sendAPIResult(publicAPI.logs.about(about), res);
});

router.get('/', function (req, res) {
  res.render('api', {
    site: config.get('site'),
    page: {
      title: doc.project.title,
      description: doc.project.description,
      keywords: '九州大学休講情報 API,九州大学,九大,休講情報,休講,API'
    },
    doc: doc
  });
});

module.exports = router;
