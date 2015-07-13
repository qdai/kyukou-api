'use strict';

const config = require('config');
const express = require('express');

const router = express.Router(); // eslint-disable-line new-cap
const site = config.get('site');

router.get('/', function (req, res) {
  res.render('status', {
    site,
    page: {
      title: 'Status - ' + site.name
    }
  });
});

module.exports = router;
