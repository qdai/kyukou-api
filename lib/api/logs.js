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
   *
   * @param {string} about - Allowed values: `scrap`, `twit_new`, `twit_tomorrow`, `delete`.
   * @returns {Promise<log>} Latest log.
   * @throws Invalid about.
   * @version 1.0.0
   * @since 1.0.0
   */
  async about (about) {
    const name = about.toString();
    if (!logNames.includes(name)) {
      throw new createHttpError.BadRequest(`:about must be one of ${logNames.join(', ')}`);
    }
    const conditions = { name };
    const log = await Log.findOne(conditions, '-_id -__v').lean().exec();
    return log;
  }
};

module.exports = ApiLogs;
