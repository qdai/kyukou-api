#!/usr/bin/env node

var BBPromise = require('bluebird');
var Twit = require('twit');

var config = require('../settings/config');
var twString = require('../lib/twstring');
var getConnection = require('../db');

var twit = new Twit(config.twitter);

// tweet tomorrow event
var taskTwitTomorrow = function () {
  return BBPromise.using(getConnection(), function (db) {
    var today = new Date();
    return BBPromise.resolve(db.model('Event').find({
      'tweet.tomorrow': false,
      eventDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0)
    }, null, {
      sort: {
        eventDate: 1,
        period: 1
      }
    }).exec()).then(function (events) {
      if (events.length === 0) {
        return events;
      }
      return BBPromise.all(events.map(function (event) {
        return new BBPromise(function (resolve, reject) {
          var text = twString(event, 'twtom');
          twit.post('statuses/update', { status: text }, function (err, data, res) {
            if (!err && res.statusCode === 200) {
              resolve(event);
            } else {
              err = err ? err : new Error('status code: ' + res.statusCode);
              reject(err);
            }
          });
        });
      }));
    }).then(function (events) {
      if (events.length === 0) {
        return [];
      }
      return BBPromise.all(events.map(function (event) {
        return BBPromise.resolve(event.update({
          'tweet.tomorrow': true
        }).exec());
      }));
    });
  }).then(function (affecteds) {
    return 'msg: ' + affecteds.length + ' event(s) posted';
  });
};

module.exports = taskTwitTomorrow;

if (require.main === module) {
  taskTwitTomorrow().catch(function (err) {
    return 'err: ' + err.stack;
  }).then(function (msg) {
    console.log(msg);
  });
}
