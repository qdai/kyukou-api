var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var TaskLog = mongoose.model('Tasklog');

var site = require('../settings/site');

router.get('/list.json', function (req, res) {
  var start_index = parseInt(req.query.start_index, 10) || 0;
  var count = parseInt(req.query.count, 10) || null;
  if (req.query.order) {
    try {
      var order = JSON.parse(req.query.order);
      var validKeys = ['raw', 'about', 'link', 'eventDate', 'pubDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'hash', 'tweet.new', 'tweet.tomorrow'];
      for (var key in order) {
        if (validKeys.indexOf(key) === -1) {
          throw new Error('Unknown order key ' + key);
        }
        order[key] = parseInt(order[key], 10);
        if (order[key] !== 1 && order[key] !== -1) {
          throw new Error('Invalid order ' + key + '\'s value ' + order[key]);
        }
      }
    } catch (e) {
      return res.status(400).json({
        error: {
          message: e.message
        }
      });
    }
  } else {
    var order = {
      eventDate: 1,
      period: 1
    };
  }
  Event.find(null, '-_id -__v', {
    skip: start_index,
    limit: count,
    sort: order
  }, function (err, events) {
    if (err) {
      return res.status(500).json({
        error: {
          message: err.message
        }
      });
    }
    res.json(events);
  });
});

router.get('/log/:about.json', function (req, res) {
  var about = req.params.about.toString();
  if (['task', 'twit_new', 'twit_tomorrow', 'delete'].indexOf(about) === -1) {
    return res.status(400).json({
      error: {
        message: ':about must be one of task, twit_new, twit_tomorrow, delete'
      }
    });
  }
  TaskLog.findOne({
    name: about
  }, '-_id -__v', function (err, tasklog) {
    if (err) {
      return res.status(500).json({
        error: {
          message: err.message
        }
      });
    }
    res.json(tasklog);
  });
});

router.get('/', function (req, res) {
  res.render('api0', {
    site: site,
    title: 'API Reference',
    apis: [
      {
        title: 'List',
        description: 'List all event(s).',
        url: 'GET: ' + site.url + '/api/list.json',
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
        url: 'GET: ' + site.url + '/api/log/:about.json',
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
