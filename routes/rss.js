var express = require('express');
var router = express.Router();
var RSS = require('rss');
var mongoose = require('mongoose');
var Event = mongoose.model('Event');

var site = require('../settings/site');
var twString = require('../lib/twstring');

router.get('/', function (req, res) {
  Event.find(null, '-_id -__v', {
    limit: 20,
    sort: {
      eventDate: 1,
      period: 1
    }
  }, function (err, events) {
    if (err) {
      return res.status(500).render('error', {
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
    for (var i = 0; i < events.length; i++) {
      feed.item({
        title: twString(events[i], 'rsttl'),
        description: twString(events[i], 'rstxt'),
        url: events[i].link,
        guid: events[i].hash,
        date: events[i].eventDate.toISOString()
      });
    }
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml('  '));
  });
});

module.exports = router;
