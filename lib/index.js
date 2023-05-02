'use strict';

const ApiEvents = require('./api/events');
const ApiLogs = require('./api/logs');
const ApiTasks = require('./api/tasks');
const db = require('../lib/utils/db');

/**
 * Kyukou API.
 */
const Api = class {
  /**
   * @param {object} config - Config object.
   * @param {string} config.mongoURI - MongoDB URI.
   * @param {Array} config.scrapers - Array of kyukou scrapers.
   * @param {twitterConfig} config.twitter - Twitter API keys.
   */
  constructor (config) {
    db.open(config.mongoURI);
    /* istanbul ignore next */
    process.on('SIGINT', async () => {
      await db.close();
      process.exit(0); // eslint-disable-line n/no-process-exit
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
