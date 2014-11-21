var express = require('express');
var router = express.Router();

var site = require('../settings/site');

router.get('/', function (req, res) {
  res.render('status', {
    site: site,
    page: {
      title: 'Status - ' + site.name
    }
  });
});

module.exports = router;
