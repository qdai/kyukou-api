var express = require('express');
var router = express.Router();
var BBPromise = require('bluebird');
var RSS = require('rss');
var mongoose = require('mongoose');
var mEvent = mongoose.model('Event');

var site = require('../settings/site');
var twString = require('../lib/twstring');

router.get('/', function (req, res) {
  BBPromise.resolve(mEvent.find(null, '-_id -__v', {
    limit: 20,
    sort: {
      pubDate: 1,
      period: 1
    }
  }).exec()).then(function (events) {
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
    res.send(feed.xml());
  }).catch(function (err) {
    res.status(500).render('error', {
      message: '500 Internal Server Error',
      error: err
    });
  });
});

module.exports = router;
