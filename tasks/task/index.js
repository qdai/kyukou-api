var Bluebird = require('bluebird');

var dbConnection = require('../../db');
var economics = require('./economics');
var education = require('./education');
var law = require('./law');
var literature = require('./literature');
var science = require('./science');

// get events
module.exports = function () {
  return Bluebird.all([economics(), education(), law(), literature(), science()]).then(function (events) {
    // flatten
    events = Array.prototype.concat.apply([], events).filter(function (event) {
      return event !== undefined;
    });
    // find or create
    return Bluebird.using(dbConnection(), function (db) {
      var Event = db.model('Event');
      return Bluebird.all(events.map(function (event) {
        if (event instanceof Error) {
          return [event, null];
        }
        return new Bluebird(function (resolve) {
          Event.findOrCreate({
            hash: event.hash
          }, event, function (err, event, created) {
            if (err) {
              err.message += ' on ' + event.raw.replace(/[\f\n\r]/g, '');
              resolve([err, null]);
            } else {
              resolve([err, created]);
            }
          });
        });
      }));
    });
  }).then(function (results) {
    var log = '';
    var count = {
      created: 0,
      exist: 0
    };
    results.forEach(function (result) {
      var err = result[0];
      var created = result[1];
      if (err) {
        if (/ValidationError: Validator failed for path `eventDate`/.test(err.toString())) {
          log += 'inf: ' + err.message + '\n';
        } else if (/Error: Invalid eventDate/.test(err.toString())) {
          log += 'wrn: ' + err.message + '\n';
        } else {
          log += 'err: ' + err.message + '\n';
        }
      } else if (created) {
        if (created) {
          count.created++;
        } else {
          count.exist++;
        }
      }
    });
    log += 'msg: ' + count.created + ' event(s) created\n';
    log += 'msg: ' + count.exist + ' event(s) already exist';
    return log;
  });
};
