'use strict';

const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const RSS = require('rss');

const mEvent = mongoose.model('Event');
const router = express.Router(); // eslint-disable-line new-cap
const site = config.get('site');

const get = require('../lib/getasstring');

router.get('/', function (req, res) {
  Promise.resolve(mEvent.find(null, '-_id -__v', {
    limit: 20,
    sort: {
      pubDate: -1,
      period: 1
    }
  }).exec()).then(function (events) {
    const feed = new RSS({
      title: site.name,
      description: site.description,
      generator: site.generator,
      feed_url: 'https://' + site.url + '/rss', // eslint-disable-line camelcase
      site_url: 'https://' + site.url, // eslint-disable-line camelcase
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
