'use strict';

const mongoose = require('mongoose');
const Twit = require('twit');

mongoose.Promise = Promise;

const mEvent = mongoose.model('Event');

// tweet new event
module.exports = config => {
  const twit = new Twit(config);
  return mEvent.find({
    'tweet.new': false
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
        const text = '新規：' + event.asString();
        twit.post('statuses/update', { status: text }, (err, data, res) => {
          /* istanbul ignore else */
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
        'tweet.new': true
      }).exec();
    }));
  }).then(affecteds => {
    return 'msg: ' + affecteds.length + ' event(s) posted';
  });
};
