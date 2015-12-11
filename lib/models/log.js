'use strict';

const mongoose = require('mongoose');

mongoose.Promise = Promise;

const Schema = mongoose.Schema;

const findOrCreate = require('../utils/findorcreate');

/**
 * Log shema.
 * @typedef {Object} log
 * @property {string} name - Log name.
 * @property {string} log - Main content.
 * @property {number} level - Error level.
 * @property {Date} time - Logged date and time.
 * @property {number} elapsedTime - Elapsed time in ms.
 *
 * @example
 * {
 *   "name": "scrap",
 *   "log": "msg: 0 event(s) created\nmsg: 19 event(s) already exist",
 *   "level": 1,
 *   "time": "2015-01-21T11:05:00.298Z",
 *   "elapsedTime": 915.768167
 * }
 */
const Tasklog = new Schema({
  name: {
    type: String,
    required: true
  },
  log: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    required: true
  },
  elapsedTime: {
    type: Number,
    required: true
  }
});

Tasklog.plugin(findOrCreate);

module.exports = mongoose.model('Tasklog', Tasklog);
