var express = require('express');
var router = express.Router();

var site = require('../settings/site');
var errorMessage = {
  error: {
    message: 'API v0 is no longer active. Please migrate to API v1 (https://' + site.url + '/api/1).'
  }
};

router.get('/list.json', function (req, res) {
  res.status(410).json(errorMessage);
});

router.get('/log/:about.json', function (req, res) {
  res.status(410).json(errorMessage);
});

router.get('/', function (req, res) {
  res.status(410).send(errorMessage.error.message);
});

module.exports = router;
