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
   * @version 1.0.0
   * @since 1.0.0
   * @param {string} about - Allowed values: `scrap`, `twit_new`, `twit_tomorrow`, `delete`.
   * @return {Promise<log>} Latest log.
   */
  about (about) {
    about = about.toString();
    if (logNames.indexOf(about) === -1) {
      return Promise.reject(createHttpError(400, ':about must be one of ' + logNames.join(', ')));
    }
    return Log.findOne({
      name: about
    }, '-_id -__v').lean().exec();
  }
};

module.exports = ApiLogs;
