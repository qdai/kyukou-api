'use strict';

const Log = require('../models/log');
const createHttpError = require('http-errors');
const logNames = require('../utils/lognames');

/**
 * Logs API.
 */
const ApiLogs = class {
  /**
   * Get latest log.
   * @version 1.0.0
   * @since 1.0.0
   * @param {string} about - Allowed values: `scrap`, `twit_new`, `twit_tomorrow`, `delete`.
   * @return {Promise<log>} Latest log.
   */
  about (about) {
    const name = about.toString();
    if (!logNames.includes(name)) {
      return Promise.reject(createHttpError(400, `:about must be one of ${logNames.join(', ')}`));
    }
    const conditions = { name };
    return Log.findOne(conditions, '-_id -__v').lean().exec();
  }
};

module.exports = ApiLogs;
