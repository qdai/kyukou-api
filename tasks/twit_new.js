#!/usr/bin/env node

var BBPromise = require('bluebird');
var Twit = require('twit');

var config = require('../settings/config');
var twString = require('../lib/twstring');
var getConnection = require('../db');

var twit = new Twit(config.twitter);

// tweet new event
var taskTwitNew = function () {
  return BBPromise.using(getConnection(), function (db) {
    return BBPromise.resolve(db.model('Event').find({
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
      return BBPromise.all(events.map(function (event) {
        return new BBPromise(function (resolve, reject) {
          var text = twString(event, 'twnew');
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
          'tweet.new': true
        }).exec());
      }));
    });
  }).then(function (affecteds) {
    return 'msg: ' + affecteds.length + ' event(s) posted';
  });
};

module.exports = taskTwitNew;

if (require.main === module) {
  taskTwitNew().catch(function (err) {
    return 'err: ' + err.stack;
  }).then(function (msg) {
    console.log(msg);
  });
}
