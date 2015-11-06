'use strict';

const moment = require('moment');
const mongoose = require('mongoose');
const Twit = require('twit');

const get = require('../utils/getasstring');

mongoose.Promise = Promise;

const mEvent = mongoose.model('Event');

// tweet tomorrow event
module.exports = config => {
  const twit = new Twit(config);
  return mEvent.find({
    'tweet.tomorrow': false,
    eventDate: moment().add(1, 'day').startOf('day').toDate()
  }, null, {
    sort: {
      eventDate: 1,
      period: 1
    }
  }).exec().then(events => {
    if (events.length === 0) {
      return events;
    }
    return Promise.all(events.map(event => {
      return new Promise((resolve, reject) => {
        const text = get(event).asTomorrowTweet();
        twit.post('statuses/update', { status: text }, (err, data, res) => {
          if (!err && res.statusCode === 200) {
            resolve(event);
          } else {
            reject(err || new Error('status code: ' + res.statusCode));
          }
        });
      });
    }));
  }).then(events => {
    if (events.length === 0) {
      return [];
    }
    return Promise.all(events.map(event => {
      return event.update({
        'tweet.tomorrow': true
      }).exec();
    }));
  }).then(affecteds => {
    return 'msg: ' + affecteds.length + ' event(s) posted';
  });
};
