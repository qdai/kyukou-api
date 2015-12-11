'use strict';

const Log = require('../models/log');
const runTask = (name, arg) => {
  const time = new Date();
  const hrtime = process.hrtime();
  return require('../tasks/' + name)(arg).catch(err => {
    /* istanbul ignore next */
    return 'err: ' + err.stack;
  }).then(log => {
    const diff = process.hrtime(hrtime);
    const tasklog = {
      name,
      log,
      level: 1,
      time,
      elapsedTime: diff[0] * 1e3 + diff[1] * 1e-6
    };
    if (/err: /.test(tasklog.log)) {
      tasklog.level = 4;
    } else if (/wrn: /.test(tasklog.log)) {
      tasklog.level = 3;
    } else if (/inf: /.test(tasklog.log)) {
      tasklog.level = 2;
    }
    return Log.findOneAndUpdate({
      name: tasklog.name
    }, tasklog, {
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
    this.config = config;
  }
  /**
   * Run scrap.
   * @return {Promise<log>} Execution result.
   */
  scrap () {
    return runTask('scrap', this.config.scrapers);
  }
  /**
   * Run twit_new.
   * @return {Promise<log>} Execution result.
   */
  twitNew () {
    return runTask('twit_new', this.config.twitter);
  }
  /**
   * Run twit_tomorrow.
   * @return {Promise<log>} Execution result.
   */
  twitTomorrow () {
    return runTask('twit_tomorrow', this.config.twitter);
  }
  /**
   * Run delete.
   * @return {Promise<log>} Execution result.
   */
  delete () {
    return runTask('delete');
  }
};

module.exports = ApiTasks;
