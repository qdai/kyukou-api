'use strict';

const db = require('../lib/utils/db');

const ApiEvents = require('./api/events');
const ApiLogs = require('./api/logs');
const ApiTasks = require('./api/tasks');

/**
 * Kyukou API.
 */
const Api = class {
  /**
   * @param {Object} config - Config object.
   * @param {string} config.mongoURI - MongoDB URI.
   * @param {Array} config.scrapers - Array of kyukou scrapers
   * @param {twitterConfig} config.twitter - Twitter config.
   */
  constructor (config) {
    db.open(config.mongoURI);
    process.on('SIGINT', () => {
      /* istanbul ignore next */
      db.close().then(() => {
        process.exit(0); // eslint-disable-line no-process-exit
      });
    });
    /**
     * @type {ApiEvents}
     */
    this.events = new ApiEvents();
    /**
     * @type {ApiLogs}
     */
    this.logs = new ApiLogs();
    /**
     * @type {ApiTasks}
     */
    this.tasks = new ApiTasks(config);
  }
};

module.exports = Api;
