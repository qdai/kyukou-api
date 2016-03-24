'use strict';

const createHttpError = require('http-errors');

const Log = require('../models/log');
const logNames = require('../utils/lognames');

/**
 * Logs API.
 */
const ApiLogs = class {
  /**
   * Get latest log.
   * @version 2.0.0
   * @since 2.0.0
   * @return {Promise<log[]>} Array of log.
   */
  values () {
    return Log.find({
      $or: logNames.map(name => ({
        name
      }))
    }, '-_id -__v').lean().exec();
  }
  /**
   * Get specified latest log.
   * @version 2.0.0
   * @since 2.0.0
   * @param {string} name - Allowed values: `scrap`, `twit_new`, `twit_tomorrow`, `delete`.
   * @return {Promise<log>} Latest log.
   */
  get (name) {
    const n = String(name);
    if (logNames.indexOf(n) === -1) {
      return Promise.reject(createHttpError(400, `:about must be one of ${logNames.join(', ')}`));
    }
    return Log.findOne({
      name: n
    }, '-_id -__v').lean().exec();
  }
};

module.exports = ApiLogs;
