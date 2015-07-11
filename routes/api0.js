'use strict';

const config = require('config');
const express = require('express');

const router = express.Router(); // eslint-disable-line new-cap

const errorMessage = {
  error: {
    message: 'API v0 is no longer active. Please migrate to API v1 (https://' + config.get('site.url') + '/api/1).'
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
