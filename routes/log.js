var express = require('express');
var router = express.Router();
var fs = require('fs');
var async = require('async');
var config = require('../secret/config');


/* GET home page. */
router.get('/', function(req, res) {
  async.parallel([
    function (callback) {
      fs.readFile('../../logs/task.log', function (err, data) {
        if (err) {
          callback(err, data);
          return;
        }
        var text = data.toString();
        if (/message: created == true/.test(text)) {
          var created = text.match(/message: created == true/g).length;
        } else {
          var created =  0;
        }
        if (/destroy: success/.test(text)) {
          var destroied = text.match(/destroy: success/g).length;
        } else {
          var destroied = 0;
        }
        var title = 'create: ' + created + '; destroy: ' + destroied + ')';
        var log = {
          id: 'task',
          status: 'success',
          title: 'Success: Task (' + title,
          log: text
        };
        if (/error/.test(text)) {
          log.status = 'danger';
          log.title = 'Fail: Task (error: ' + text.match(/error/g).length + '; ' + title;
        }
        if (!text) {
          log.status = 'danger';
          log.title = 'Fail: Task (error: null; ' + title;
        }
        callback(null, log);
      });
    },
    function (callback) {
      fs.readFile('../../logs/twit_new.log', function (err, data) {
        if (err) {
          callback(err, data);
          return;
        }
        var text = data.toString();
        if (/\((\d*)\//.test(text)) {
          var count = parseInt(text.match(/\((\d*)\//)[1]);
        } else {
          var count = 0;
        }
        if (/message: database update success/.test(text)) {
          var update = text.match(/message: database update success/g).length;
        } else {
          var update = 0;
        }
        if (/twitter post id/.test(text)) {
          var twitter = text.match(/twitter post id/g).length;
        } else {
          var twitter = 0;
        }
        if (/message: tweeted\((\S*)\)/.test(text)) {
          var posted = text.match(/message: tweeted\((\S*)\)/)[1];
        } else {
          var posted = 0;
        }
        var log = {
          id: 'tweet-new',
          status: 'success',
          title: 'Success: Tweet new event (tweeted: ' + posted + ')',
          log: text
        };
        if (/error/.test(text) || update !== count || twitter !== count) {
          log.status = 'danger';
          log.title = 'Fail: Tweet new event (count: ' + count + '; updated: ' + update + '; posted: ' + twitter + ')';
        }
        if (!text) {
          log.status = 'danger';
          log.title = 'Fail: Tweet new event (error: null)';
        }
        callback(null, log);
      });
    },
    function (callback) {
      fs.readFile('../../logs/twit_tomorrow.log', function (err, data) {
        if (err) {
          callback(err, data);
          return;
        }
        var text = data.toString();
        if (/twitter post id/.test(text)) {
          var posted = text.match(/twitter post id/g).length;
        } else {
          var posted = 0;
        }
        var log = {
          id: 'tweet-tomorrow',
          status: 'success',
          title: 'Success: Tweet tomorrow event (posted: ' + posted + ')',
          log: text
        };
        if (!text || /error/.test(text)) {
          log.status = 'danger';
          log.title = 'Fail: Tweet tomorrow event';
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
      name: config.site.name,
      title: 'Latest logs · ' + config.site.name,
      author: config.package.author,
      logs: logs
    });
  });
});

module.exports = router;
