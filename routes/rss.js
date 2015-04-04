var BBPromise = require('bluebird');
var config = require('config');
var express = require('express');
var mongoose = require('mongoose');
var RSS = require('rss');

var mEvent = mongoose.model('Event');
var router = express.Router();
var site = config.get('site');

var get = require('../lib/getasstring');

router.get('/', function (req, res) {
  BBPromise.resolve(mEvent.find(null, '-_id -__v', {
    limit: 20,
    sort: {
      pubDate: -1,
      period: 1
    }
  }).exec()).then(function (events) {
    var feed = new RSS({
      title: site.name,
      description: site.description,
      generator: site.generator,
      feed_url: 'https://' + site.url + '/rss',
      site_url: 'https://' + site.url,
      language: site.lang,
      ttl: 180
    });
    for (var i = 0; i < events.length; i++) {
      feed.item({
        title: get(events[i]).asRSSTitle(),
        description: get(events[i]).asRSSDescription(),
        url: events[i].link,
        guid: events[i].hash,
        date: events[i].pubDate.toISOString()
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
