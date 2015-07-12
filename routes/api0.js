'use strict';

const config = require('config');
const createHttpError = require('http-errors');
const express = require('express');

const router = express.Router(); // eslint-disable-line new-cap

const errorMessage = 'API v0 is no longer active. Please migrate to API v1 (https://' + config.get('site.url') + '/api/1).';

router.get('/list.json', function () {
  throw createHttpError(410, errorMessage);
});

router.get('/log/:about.json', function () {
  throw createHttpError(410, errorMessage);
});

router.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(err.status || 500).json({
    error: {
      message: err.message
    }
  });
});

router.get('/', function () {
  throw createHttpError(410, errorMessage);
});

module.exports = router;
