var express = require('express');
var router = express.Router();
var async = require('async');
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var TaskLog = mongoose.model('Tasklog');

var site = require('../settings/site');

router.get('/list.json', function(req, res) {
  var start_index = parseInt(req.query.start_index) || 0;
  var count = parseInt(req.query.count) || null;
  if (req.query.order) {
    try {
      var order = JSON.parse(req.query.order);
      var keys = Object.keys(order);
      var validKeys = ['raw', 'about', 'link', 'eventDate', 'pubDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'hash', 'tweet.new', 'tweet.tomorrow'];
      for (var i = 0; i < keys.length; i++) {
        if (validKeys.indexOf(keys[i]) === -1) {
          throw new Error('Unknown order key ' + keys[i]);
        }
        order[keys[i]] = parseInt(order[keys[i]], 10);
        if (order[keys[i]] !== 1 && order[keys[i]] !== -1) {
          throw new Error('Invalid order `' + keys[i] + '` value ' + order[keys[i]]);
        }
      }
    } catch (e) {
      res.status(400);
      return res.render('error', {
        message: '400 Bad Request',
        error: e
      });
    }
  } else {
    var order = {
      eventDate: 1,
      period: 1
    };
  }
  async.waterfall([
    function (callback) {
      Event.find(null, '-_id -__v', {
        skip: start_index,
        limit: count,
        sort: order
      }, function (err, events) {
        if (err) {
          return callback(err, null);
        }
        return callback(null, events);
      });
    }
  ], function (err, events) {
    if (err) {
      res.status(500);
      return res.render('error', {
        message: '500 Internal Server Error',
        error: err
      });
    }
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(events));
  });
});

router.get('/log/:about.json', function(req, res) {
  var about = req.params.about.toString();
  if (['task', 'twit_new', 'twit_tomorrow', 'delete'].indexOf(about) === -1) {
    res.status(400);
    return res.render('error', {
      message: '400 Bad Request',
      error: {
        status: ':about must be one of `task`, `twit_new`, `twit_tomorrow`, `delete`'
      }
    });
  }
  async.waterfall([
    function (callback) {
      TaskLog.findOne({
        name: about
      }, '-_id -__v', function (err, tasklog) {
        if (err) {
          return callback(err, null);
        }
        return callback(null, tasklog);
      });
    }
  ], function (err, tasklog) {
    if (err) {
      res.status(500);
      return res.render('error', {
        message: '500 Internal Server Error',
        error: err
      });
    }
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(tasklog, null, '  '));
  });
});

router.get('/', function(req, res) {
  res.render('api', {
    site: site,
    title: 'API Reference',
    apis: [
      {
        title: 'List',
        description: 'List all event(s).',
        url: 'GET: http://kyukou-kyudai.rhcloud.com/api/list.json',
        parameters: [
          {
            key: 'start_index (optional)',
            type: 'Number',
            description: 'Starting index. default: 0'
          },
          {
            key: 'count (optional)',
            type: 'Number',
            description: 'event(s) count. returns all events if count is not specified.'
          },
          {
            key: 'order (optional)',
            type: 'JSON',
            description: 'Order object. default: { eventDate: 1, period: 1 }'
          }
        ]
      },
      {
        title: 'Log',
        description: 'Show latest log.',
        url: 'GET: http://kyukou-kyudai.rhcloud.com/api/log/:about.json',
        parameters: [
          {
            key: 'about (require)',
            type: 'String',
            description: 'Must be `task` or `twit_new` or `twit_tomorrow` or `delete`.'
          }
        ]
      }
    ]
  });
});

module.exports = router;
