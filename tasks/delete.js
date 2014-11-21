#!/usr/bin/env node

var async = require('async');
var mongoose = require('mongoose');
require('../models/event')();
var Event = mongoose.model('Event');

var config = require('../settings/config');
var db = require('../lib/db');

var today = new Date();
// delete expired data
db.connect(config.mongoURI);
Event.find({
  eventDate: {
    $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0)
  }
}, function (err, events) {
  if (err) {
    console.log('err: find expired event.');
    console.log('msg: %s', err);
    return db.disconnect();
  }
  if (events.length == 0) {
    console.log('msg: no expired event found.');
    return db.disconnect();
  }
  async.each(events, function (event, callback) {
    event.remove(function (err, event) {
      if (err) {
        console.log('err: hash: %s remove fail.', event.hash);
        console.log('msg: %s', err);
      } else {
        console.log('msg: hash: %s remove success.', event.hash);
      }
      return callback();
    });
  }, function (err) {
    return db.disconnect();
  });
});
