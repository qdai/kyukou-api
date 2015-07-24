'use strict';

const mongoose = require('mongoose');
const Twit = require('twit');

const get = require('../utils/getasstring');
const mEvent = mongoose.model('Event');

// tweet new event
module.exports = function (config) {
  const twit = new Twit(config);
  return Promise.resolve(mEvent.find({
    'tweet.new': false
  }, null, {
    sort: {
      eventDate: 1,
      period: 1
    }
  }).exec()).then(function (events) {
    if (events.length === 0) {
      return events;
    }
    return Promise.all(events.map(function (event) {
      return new Promise(function (resolve, reject) {
        const text = get(event).asNewTweet();
        twit.post('statuses/update', { status: text }, function (err, data, res) {
          if (!err && res.statusCode === 200) {
            resolve(event);
          } else {
            reject(err || new Error('status code: ' + res.statusCode));
          }
        });
      });
    }));
  }).then(function (events) {
    if (events.length === 0) {
      return [];
    }
    return Promise.all(events.map(function (event) {
      return event.update({
        'tweet.new': true
      }).exec();
    }));
  }).then(function (affecteds) {
    return 'msg: ' + affecteds.length + ' event(s) posted';
  });
};