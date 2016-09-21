'use strict';

const Event = require('../models/event');
const Hash = require('../utils/hash');
const Log = require('../models/log');
const Twitter = require('../utils/twitter');
const _ = require('lodash');
const moment = require('moment');
const runTask = require('../utils/runtask');

const buildTweetLog = arr => {
  const errs = arr.filter(a => a instanceof Error);
  /* istanbul ignore next */
  const logs = [
    ...errs.map(err => `err: ${err.message}`),
    `msg: ${arr.length - errs.length} event(s) posted`
  ];
  return logs.join('\n');
};
const runTaskAndSave = (name, fn) => {
  return runTask(fn).then(log => {
    log.name = name;
    return Log.findOneAndUpdate({
      name: log.name
    }, log, {
      new: true,
      select: '-_id -__v'
    }).lean().exec();
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
    this.twitter = new Twitter(config.twitter);
  }
  /**
   * Run scrap.
   * @return {Promise<log>} Execution result.
   */
  scrap () {
    return runTaskAndSave('scrap', () => {
      return Promise.all(this.scrapers.map(scraper => scraper())).then(events => {
        const flattenedEvents = _.flow([_.flatten, _.compact])(events);
        // find or create
        return Promise.all(flattenedEvents.map(event => {
          if (event instanceof Error) {
            return event;
          }
          // add hash
          event.hash = Hash.create(event.raw);
          return Event.findOrCreate({
            hash: event.hash
          }, event).then(result => {
            return result[1];
          }).catch(err => {
            err.message += ` on ${event.raw.replace(/[\f\n\r]/g, '')}`;
            return err;
          });
        }));
      }).then(results => {
        let created = 0;
        let exist = 0;
        const logs = [
          ...results.map(result => {
            if (result instanceof Error) {
              if (/ValidationError: Validator failed for path `eventDate`/.test(result.toString())) {
                return `inf: ${result.message}`;
              } else if (/Error: Invalid eventDate/.test(result.toString())) {
                return `wrn: ${result.message}`;
              }
              return `err: ${result.message}`;
            } else if (result === true) {
              created++;
              return '';
            }
            exist++;
            return '';
          }).filter(str => str !== ''),
          `msg: ${created} event(s) created`,
          `msg: ${exist} event(s) already exist`
        ];
        return logs.join('\n');
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
        return Promise.all(events.map(event => {
          const text = `新規：${event.asString()}`;
          return this.twitter.post(text).then(() => {
            return event.update({
              'tweet.new': true
            }).exec();
          }).catch(err => {
            /* istanbul ignore next */
            return err;
          });
        }));
      }).then(buildTweetLog);
    });
  }
  /**
   * Run twit_tomorrow.
   * @return {Promise<log>} Execution result.
   */
  twitTomorrow () {
    return runTaskAndSave('twit_tomorrow', () => {
      return Event.find({
        eventDate: moment().add(1, 'day').startOf('day').toDate(),
        'tweet.tomorrow': false
      }, null, {
        sort: {
          eventDate: 1,
          period: 1
        }
      }).exec().then(events => {
        return Promise.all(events.map(event => {
          const text = `明日：${event.asString()}`;
          return this.twitter.post(text).then(() => {
            return event.update({
              'tweet.tomorrow': true
            }).exec();
          }).catch(err => {
            /* istanbul ignore next */
            return err;
          });
        }));
      }).then(buildTweetLog);
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
        return `msg: ${removed.result.n} event(s) deleted`;
      });
    });
  }
};

module.exports = ApiTasks;
