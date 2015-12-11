'use strict';

const Hash = require('../utils/hash');

const mEvent = require('../models/event');

// get events
module.exports = scrapers => {
  return Promise.all(scrapers.map(scraper => scraper())).then(events => {
    // flatten
    events = Array.prototype.concat.apply([], events).filter(event => {
      return typeof event === 'object';
    });
    // find or create
    return Promise.all(events.map(event => {
      if (event instanceof Error) {
        return [event, null];
      }
      // add hash
      event.hash = Hash.create(event.raw);
      return mEvent.findOrCreate({
        hash: event.hash
      }, event).then(result => {
        return [null, result[1]];
      }).catch(err => {
        err.message += ' on ' + event.raw.replace(/[\f\n\r]/g, '');
        return [err, null];
      });
    }));
  }).then(results => {
    let log = '';
    const count = {
      created: 0,
      exist: 0
    };
    results.forEach(result => {
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
