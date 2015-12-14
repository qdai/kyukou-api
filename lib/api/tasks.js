'use strict';

const moment = require('moment');
const Twit = require('twit');

const Event = require('../models/event');
const Hash = require('../utils/hash');
const Log = require('../models/log');
const runTask = require('../utils/runtask');
const runTaskAndSave = (name, fn) => {
  return runTask(fn).then(log => {
    log.name = name;
    return Log.findOneAndUpdate({
      name: log.name
    }, log, {
      new: true
    }).lean().exec().then(result => {
      delete result._id; // eslint-disable-line no-underscore-dangle
      delete result.__v; // eslint-disable-line no-underscore-dangle
      return result;
    });
  });
};

/**
 * @typedef {Object} twitterConfig
 * @property {string} consumer_key - Consumer key for Twitter API.
 * @property {string} consumer_secret - Consumer secret for Twitter API.
 * @property {string} access_token - Access token for Twitter API.
 * @property {string} access_token_secret - Access secret for Twitter API.
 */

/**
 * Tasks API.
 */
const ApiTasks = class {
  /**
   * @param {Object} config - Config object.
   * @param {Array} config.scrapers - Array of kyukou scrapers
   * @param {twitterConfig} config.twitter - Twitter config.
   */
  constructor (config) {
    this.scrapers = config.scrapers;
    this.twit = new Twit(config.twitter);
  }
  /**
   * Run scrap.
   * @return {Promise<log>} Execution result.
   */
  scrap () {
    return runTaskAndSave('scrap', () => {
      return Promise.all(this.scrapers.map(scraper => scraper())).then(events => {
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
          return Event.findOrCreate({
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
    });
  }
  /**
   * Run twit_new.
   * @return {Promise<log>} Execution result.
   */
  twitNew () {
    return runTaskAndSave('twit_new', () => {
      return Event.find({
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
            this.twit.post('statuses/update', { status: text }, (err, data, res) => {
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
    });
  }
  /**
   * Run twit_tomorrow.
   * @return {Promise<log>} Execution result.
   */
  twitTomorrow () {
    return runTaskAndSave('twit_tomorrow', () => {
      return Event.find({
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
            const text = '明日：' + event.asString();
            this.twit.post('statuses/update', { status: text }, (err, data, res) => {
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
            'tweet.tomorrow': true
          }).exec();
        }));
      }).then(affecteds => {
        return 'msg: ' + affecteds.length + ' event(s) posted';
      });
    });
  }
  /**
   * Run delete.
   * @return {Promise<log>} Execution result.
   */
  delete () {
    return runTaskAndSave('delete', () => {
      return Event.find({
        eventDate: {
          $lte: moment().subtract(1, 'day').startOf('day').toDate()
        }
      }).remove().then(removed => {
        return 'msg: ' + removed.result.n + ' event(s) deleted';
      });
    });
  }
};

module.exports = ApiTasks;
