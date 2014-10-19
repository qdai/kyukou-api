#!/usr/bin/env node

var async = require('async');
var Twit = require('twit');
var mongoose = require('mongoose');
require('../models/event')();
var Event = mongoose.model('Event');

var config = require('../settings/config');
var twString = require('../lib/twstring');
var db = require('../lib/db');

var twit = new Twit(config.twitter);

// tweet new event
db.connect();
Event.find({
  'tweet.new': false
}, function (err, events) {
  //console.log(events)
  if (err) {
    console.log('error: find not tweeted event');
    console.log('message: ' + err);
    return db.disconnect();
  }
  if (events.length == 0) {
    console.log('msg: no new event found.');
    return db.disconnect();
  }
  async.each(events, function (event, eachCallback) {
    async.waterfall([
      function (waterfallCallback) {
        var text = twString(event, 'twnew');
        twit.post('statuses/update', { status: text }, function(err, data, response) {
          if (err || response.statusCode !== 200) {
            if (!err) {
              err = new Error('twitter post status code: ' + res.statusCode);
            }
            return waterfallCallback(err, null);
          }
          if (data['id_str']) {
            return waterfallCallback(null, data);
          } else {
            return waterfallCallback(new Error('unknown response from twitter: ' + data), null);
          }
        });
      }
    ], function (err, data) {
      if (err) {
        console.log('err: twitter post failed.');
        console.log('msg: %s', err);
        return eachCallback();
      }
      console.log('msg: twitter post id: %s', data['id_str']);
      event.update({
        'tweet.new': true
      }, function (err, numberAffected) {
        if (err || numberAffected === 0) {
          console.log('err: hash: %s tweet.new update failed.', event.hash);
          console.log('msg: ' + err);
          return eachCallback();
        }
        console.log('msg: hash: %s tweet.new update success.', event.hash);
        return eachCallback();
      });
    });
  }, function (err) {
    return db.disconnect();
  });
});
