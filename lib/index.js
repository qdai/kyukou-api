'use strict';

const db = require('./db');

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
   * @param {twitterConfig} config.twitter - Twitter config.
   */
  constructor (config) {
    db.open(config.mongoURI).then(() => {
      /* istanbul ignore next */
      console.log('Mongoose connected'); // eslint-disable-line no-console
    });
    process.on('SIGINT', () => {
      /* istanbul ignore next */
      db.close().then(() => {
        console.log('Mongoose disconnected'); // eslint-disable-line no-console
        process.exit(0);
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
