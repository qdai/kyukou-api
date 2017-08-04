'use strict';

const findOrCreate = require('../utils/findorcreate');
const logNames = require('../utils/lognames');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

const { Schema } = mongoose;

/**
 * Log shema.
 * @typedef {Object} log
 * @property {number} elapsedTime - Elapsed time in ms.
 * @property {number} level - Error level.
 * @property {string} log - Main content.
 * @property {string} name - Log name.
 * @property {Date} time - Logged date and time.
 *
 * @example
 * {
 *   "elapsedTime": 915.768167,
 *   "level": 1,
 *   "log": "msg: 0 event(s) created\nmsg: 19 event(s) already exist",
 *   "name": "scrap",
 *   "time": "2015-01-21T11:05:00.298Z"
 * }
 */
const Tasklog = new Schema({
  elapsedTime: {
    required: true,
    type: Number
  },
  level: {
    required: true,
    type: Number
  },
  log: {
    required: true,
    type: String
  },
  name: {
    required: true,
    type: String,
    validate (value) {
      return logNames.includes(value);
    }
  },
  time: {
    required: true,
    type: Date
  }
});

Tasklog.plugin(findOrCreate);

module.exports = mongoose.model('Tasklog', Tasklog);
