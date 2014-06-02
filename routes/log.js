var express = require('express');
var router = express.Router();
var fs = require('fs');
var async = require('async');
var config = require('../secret/config');


/* GET home page. */
router.get('/', function(req, res) {
  async.parallel([
    function (callback) {
      fs.readFile('../../logs/task.log', function (err, text) {
        if (err) {
          callback(err, text);
          return;
        }
        var log = {
          id: 'task',
          status: 'success',
          title: 'Success: Task',
          log: text
        };
        if (/error/.test(text)) {
          log.status = 'danger';
          log.title = 'Fail: Task';
        }
        callback(null, log);
      });
    },
    function (callback) {
      fs.readFile('../../logs/twit_new.log', function (err, text) {
        if (err) {
          callback(err, text);
          return;
        }
        var log = {
          id: 'tweet-new',
          status: 'success',
          title: 'Success: Tweet (new event)',
          log: text
        };
        if (/error/.test(text)) {
          log.status = 'danger';
          log.title = 'Fail: Tweet (new event)';
        }
        callback(null, log);
      });
    },
    function (callback) {
      fs.readFile('../../logs/twit_tomorrow.log', function (err, text) {
        if (err) {
          callback(err, text);
          return;
        }
        var log = {
          id: 'tweet-tomorrow',
          status: 'success',
          title: 'Success: Tweet (tomorrow event)',
          log: text
        };
        if (/error/.test(text)) {
          log.status = 'danger';
          log.title = 'Fail: Tweet (tomorrow event)';
        }
        callback(null, log);
      });
    }
  ], function (err, logs) {
    if (err) {
      res.render('index', { title: JSON.stringify(err) });
      return;
    }
    res.render('log', {
      title: 'Latest logs · ' + config.site.name,
      author: config.site.author,
      logs: logs
    });
  });
});

module.exports = router;
