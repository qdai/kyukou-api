var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var async = require('async');

var site = require('../settings/site');

router.get('/', function(req, res) {
  res.render('status', {
    site: site,
    title: 'Status'
  });
});

module.exports = router;
