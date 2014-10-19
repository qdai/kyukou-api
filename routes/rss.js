var express = require('express');
var router = express.Router();
var async = require('async');
var RSS = require('rss');
var mongoose = require('mongoose');
var Event = mongoose.model('Event');

var site = require('../settings/site');
var twString = require('../lib/twstring');

router.get('/', function(req, res) {
  async.waterfall([
    function (callback) {
      Event.find(null, '-_id -__v', {
        limit: 20,
        sort: {
          eventDate: 1,
          period: 1
        }
      }, function (err, events) {
        if (err) {
          callback(err, null);
        }
        for (var i = 0; i < events.length; i++) {
          events[i].datetime = events[i].eventDate.toISOString();
          events[i].dateformatted = events[i].eventDate.getFullYear() + '年' + (events[i].eventDate.getMonth() + 1) + '月' + events[i].eventDate.getDate() + '日（' + ['日','月','火','水','木','金','土'][events[i].eventDate.getDay()] + ')';
        }
        callback(null, events);
      });
    }
  ],function (err, events) {
    if (err) {
      res.status(500);
      return res.render('error', {
        message: '500 Internal Server Error',
        error: err
      });
    }
    var feed = new RSS({
      title: site.name,
      description: site.description,
      genarator: site.genarator,
      feed_url: site.url + '/rss',
      site_url: site.url,
      language: site.lang,
      ttl: 180
    });
    var title,
        desc;
    for (var i = 0; i < events.length; i++) {
      title = twString(events[i], 'rsttl');
      desc = twString(events[i], 'rstxt');
      feed.item({
        title: title,
        description: desc,
        url: events[i].link,
        guid: events[i].hash,
        date: events[i].datetime
      });
    }
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml('  '));
  });
});

module.exports = router;
