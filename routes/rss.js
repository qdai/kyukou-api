'use strict';

const config = require('config');
const express = require('express');
const RSS = require('rss');

const router = express.Router(); // eslint-disable-line new-cap
const site = config.get('site');

const get = require('../lib/getasstring');
const publicAPI = require('../api').public;

router.get('/', function (req, res) {
  publicAPI.events.list().then(function (events) {
    const feed = new RSS({
      title: site.name,
      description: site.description,
      generator: site.generator,
      feed_url: 'https://' + site.url + '/rss', // eslint-disable-line camelcase
      site_url: 'https://' + site.url, // eslint-disable-line camelcase
      language: site.lang,
      ttl: 180
    });
    events = events.sort(function (a, b) {
      return b.pubDate.getTime() - a.pubDate.getTime();
    });
    for (let i = 0; i < 20; i++) {
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
  });
});

module.exports = router;
