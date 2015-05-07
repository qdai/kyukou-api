var Bluebird = require('bluebird');
var config = require('config');
var express = require('express');
var mongoose = require('mongoose');
var RSS = require('rss');

var mEvent = mongoose.model('Event');
var router = express.Router();
var site = config.get('site');

var get = require('../lib/getasstring');

router.get('/', function (req, res) {
  Bluebird.resolve(mEvent.find(null, '-_id -__v', {
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
    events.forEach(function (event) {
      feed.item({
        title: get(event).asRSSTitle(),
        description: get(event).asRSSDescription(),
        url: event.link,
        guid: event.hash,
        date: event.pubDate.toISOString()
      });
    });
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml());
  });
});

module.exports = router;
