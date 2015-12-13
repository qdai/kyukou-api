'use strict';

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

const taskDelete = require('../tasks/delete');
const taskScrap = require('../tasks/scrap');
const taskTwitNew = require('../tasks/twit_new');
const taskTwitTomorrow = require('../tasks/twit_tomorrow');

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
    return runTaskAndSave('scrap', taskScrap.bind(null, this.config.scrapers));
  }
  /**
   * Run twit_new.
   * @return {Promise<log>} Execution result.
   */
  twitNew () {
    return runTaskAndSave('twit_new', taskTwitNew.bind(null, this.config.twitter));
  }
  /**
   * Run twit_tomorrow.
   * @return {Promise<log>} Execution result.
   */
  twitTomorrow () {
    return runTaskAndSave('twit_tomorrow', taskTwitTomorrow.bind(null, this.config.twitter));
  }
  /**
   * Run delete.
   * @return {Promise<log>} Execution result.
   */
  delete () {
    return runTaskAndSave('delete', taskDelete);
  }
};

module.exports = ApiTasks;
