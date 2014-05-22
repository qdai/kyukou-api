var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '九州大学休講情報（非公式）（under development）' });
});

module.exports = router;
