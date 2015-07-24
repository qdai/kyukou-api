'use strict';

const mongoose = require('mongoose');

const economics = require('./economics');
const education = require('./education');
const law = require('./law');
const literature = require('./literature');
const science = require('./science');

const mEvent = mongoose.model('Event');

// get events
module.exports = function () {
  return Promise.all([economics(), education(), law(), literature(), science()]).then(function (events) {
    // flatten
    events = Array.prototype.concat.apply([], events).filter(function (event) {
      return event !== undefined;
    });
    // find or create
    return Promise.all(events.map(function (event) {
      if (event instanceof Error) {
        return [event, null];
      }
      return new Promise(function (resolve) {
        mEvent.findOrCreate({
          hash: event.hash
        }, event, function (err, result, created) {
          if (err) {
            err.message += ' on ' + result.raw.replace(/[\f\n\r]/g, '');
            resolve([err, null]);
          } else {
            resolve([err, created]);
          }
        });
      });
    }));
  }).then(function (results) {
    let log = '';
    const count = {
      created: 0,
      exist: 0
    };
    results.forEach(function (result) {
      const err = result[0];
      const created = result[1];
      if (err) {
        if (/ValidationError: Validator failed for path `eventDate`/.test(err.toString())) {
          log += 'inf: ' + err.message + '\n';
        } else if (/Error: Invalid eventDate/.test(err.toString())) {
          log += 'wrn: ' + err.message + '\n';
        } else {
          log += 'err: ' + err.message + '\n';
        }
      } else if (created) {
        count.created++;
      } else {
        count.exist++;
      }
    });
    log += 'msg: ' + count.created + ' event(s) created\n';
    log += 'msg: ' + count.exist + ' event(s) already exist';
    return log;
  });
};
