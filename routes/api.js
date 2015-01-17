var express = require('express');
var router = express.Router();

var publicAPI = require('../api').public;
var sendAPIResult = require('../lib/sendapiresult');

var site = require('../settings/site');

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
    site: site,
    page: {
      title: site.name + ' API v1',
      description: '九州大学休講情報のAPIです。教育学部、文学部、法学部、理学部、経済学部に対応しています。',
      keywords: '九州大学休講情報 API,九州大学,九大,休講情報,休講,API'
    }
  });
});

module.exports = router;
