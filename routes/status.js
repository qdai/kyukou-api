var config = require('config');
var express = require('express');

var router = express.Router();
var site = config.get('site');

router.get('/', function (req, res) {
  res.render('status', {
    site: site,
    page: {
      title: 'Status - ' + site.name
    }
  });
});

module.exports = router;
