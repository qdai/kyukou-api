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
  const logs = [...errs.map(err => `err: ${err.message}`), `msg: ${arr.length - errs.length} event(s) posted`];
  return logs.join('\n');
};
const runTaskAndSave = async (name, fn) => {
  const log = {
    name,
    ...await runTask(fn)
  };
  const options = {
    new: true,
    select: '-_id -__v'
  };
  return Log.findOneAndUpdate({ name }, log, options).lean().exec();
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
    return runTaskAndSave('scrap', async () => {
      const events = await Promise.all(this.scrapers.map(scraper => scraper()))
        .then(_.flow([_.flatten, _.compact]));
      const findOrCreate = async event => {
        if (event instanceof Error) {
          return event;
        }
        // Add hash
        event.hash = Hash.create(event.raw);

        const conditions = { hash: event.hash };
        try {
          const [, created] = await Event.findOrCreate(conditions, event);
          return created;
        } catch (err) {
          const message = `${err.message} on ${event.raw.replace(/[\f\n\r]/g, '')}`;
          return new Error(message);
        }
      };
      const results = await Promise.all(events.map(findOrCreate));
      let created = 0;
      let exist = 0;
      const logs = [
        ...results.map(result => {
          if (result instanceof Error) {
            if (result.message.includes('Event validation failed: eventDate: Validator failed')) {
              return `inf: ${result.message}`;
            } else if (result.message.includes('Invalid eventDate')) {
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
  }

  /**
   * Run twit_new.
   * @return {Promise<log>} Execution result.
   */
  twitNew () {
    return runTaskAndSave('twit_new', async () => {
      const conditions = { 'tweet.new': false };
      const options = {
        sort: {
          eventDate: 1,
          period: 1
        }
      };
      const events = await Event.find(conditions, null, options).exec();
      const postEvent = async event => {
        const text = `新規：${event.asString()}`;
        try {
          await this.twitter.post(text);
          return event.update({ 'tweet.new': true }).exec();
        } catch (err) {
          /* istanbul ignore next */
          return err;
        }
      };
      return Promise.all(events.map(postEvent))
        .then(buildTweetLog);
    });
  }

  /**
   * Run twit_tomorrow.
   * @return {Promise<log>} Execution result.
   */
  twitTomorrow () {
    return runTaskAndSave('twit_tomorrow', async () => {
      const conditions = {
        eventDate: moment().add(1, 'day').startOf('day').toDate(),
        'tweet.tomorrow': false
      };
      const options = {
        sort: {
          eventDate: 1,
          period: 1
        }
      };
      const events = await Event.find(conditions, null, options).exec();
      const postEvent = async event => {
        const text = `明日：${event.asString()}`;
        try {
          await this.twitter.post(text);
          return event.update({ 'tweet.tomorrow': true }).exec();
        } catch (err) {
          /* istanbul ignore next */
          return err;
        }
      };
      return Promise.all(events.map(postEvent))
        .then(buildTweetLog);
    });
  }

  /**
   * Run delete.
   * @return {Promise<log>} Execution result.
   */
  delete () {
    return runTaskAndSave('delete', async () => {
      const conditions = { eventDate: { $lte: moment().subtract(1, 'day').startOf('day').toDate() } };
      const removed = await Event.find(conditions).remove();
      return `msg: ${removed.n} event(s) deleted`;
    });
  }
};

module.exports = ApiTasks;
