'use strict';

const db = require('./db');

const ApiEvents = require('./api/events');
const ApiLogs = require('./api/logs');
const ApiTasks = require('./api/tasks');

const Api = class {
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
    this.events = new ApiEvents();
    this.logs = new ApiLogs();
    this.tasks = new ApiTasks(config.twitter);
  }
};

module.exports = Api;
