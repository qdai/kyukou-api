var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var TaskLog = mongoose.model('Tasklog');

var site = require('../settings/site');

router.get('/events', function (req, res) {
  res.status(400).type('text/plain').send('Bad Request');
});

router.get('/events/list.json', function (req, res) {
  var start_index = parseInt(req.query.start_index, 10) || 0;
  var count = parseInt(req.query.count, 10) || null;
  Event.find(null, '-_id -__v', {
    skip: start_index,
    limit: count,
    sort: {
      eventDate: 1,
      period: 1
    }
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

router.get('/events/:yyyy-:mm-:dd.json', function (req, res) {
  var date = new Date(parseInt(req.params.yyyy, 10), parseInt(req.params.mm, 10) - 1, parseInt(req.params.dd, 10));
  if (isNaN(date.getTime())) {
    return res.status(400).json({
      error: {
        message: 'Invalid Date'
      }
    });
  }
  var count = parseInt(req.query.count, 10) || null;
  Event.find({
    eventDate: date
  }, '-_id -__v', {
    limit: count,
    sort: {
      period: 1
    }
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

router.get('/events/search.json', function (req, res) {
  if (!req.query.q) {
    return res.status(400).json({
      error: {
        message: 'query is not specified'
      }
    });
  }
  var q = String(req.query.q).replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
  if (q.length >= 128) {
    return res.status(400).json({
      error: {
        message: 'Too long query'
      }
    });
  }
  var count = parseInt(req.query.count, 10) || null;
  Event.find({
    $or: [{
      department: {
        $regex: q
      }
    }, {
      raw: {
        $regex: q
      }
    }, {
      about: {
        $regex: q
      }
    }]
  }, '-_id -__v', {
    limit: count,
    sort: {
      eventDate: 1,
      period: 1
    }
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

router.get('/logs', function (req, res) {
  res.status(400).type('text/plain').send('Bad Request');
});

router.get('/logs/:about.json', function (req, res) {
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
  res.render('api', {
    site: site,
    page: {
      title: site.name + ' API v1',
      description: '九州大学休講情報のAPIです。教育学部、文学部、法学部、理学部、経済学部に対応しています。',
      keywords: '九州大学休講情報 API,九州大学,九大,休講情報,休講,API'
    }
  });
});

module.exports = router;
