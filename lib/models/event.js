'use strict';

const moment = require('moment');
const mongoose = require('mongoose');

moment.locale('ja');
mongoose.Promise = Promise;

const Schema = mongoose.Schema;

const findOrCreate = require('../utils/findorcreate');
const asString = require('../utils/eventasstring');

/**
 * Event shema.
 * @typedef {Object} event
 * @property {string} about - Event type.
 * @property {string} department - Department.
 * @property {string} subject - Subject.
 * @property {string} period - Event period.
 * @property {string} link - Event URL.
 * @property {Date} eventDate - Event date.
 * @property {Date} pubDate - Date the event published.
 * @property {string} raw - Event source.
 * @property {string} hash - Event ID.
 * @property {Object} tweet - Tweet flags.
 * @property {boolean} tweet.new - New or not.
 * @property {boolean} tweet.tomorrow - Tomorrow or not.
 * @property {string} [campus] - Campus.
 * @property {string} [room] - Room.
 * @property {string} [teacher] - Teacher.
 * @property {string} [note] - Notes.
 *
 * @example
 * {
 *   "about": "休講",
 *   "department": "教育学部",
 *   "subject": "教科名",
 *   "period": "1",
 *   "link": "http://www.education.kyushu-u.ac.jp/topics/student_index",
 *   "eventDate": "2015-01-18T15:00:00.000Z",
 *   "pubDate": "2015-01-15T15:00:00.000Z",
 *   "raw": "【休講】1月19日（月） 1限 「教科名」（教員名教員）",
 *   "hash": "89c5918f7d1decffcfd72eebec6413ac7f3795d71f335bd97129df0c69818e8f",
 *   "tweet": {
 *     "tomorrow": true,
 *     "new": true
 *   },
 *   "teacher": "教員名"
 * }
 */
const Event = new Schema({
  raw: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    validate (value) {
      value = moment(value);
      const date = moment().subtract(18, 'hours');
      return !value.isBefore(date);
    },
    required: true
  },
  pubDate: {
    type: Date,
    default: new Date()
  },
  period: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  teacher: {
    type: String
  },
  campus: {
    type: String
  },
  room: {
    type: String
  },
  note: {
    type: String
  },
  hash: {
    type: String,
    required: true
  },
  tweet: {
    new: {
      type: Boolean,
      default: false
    },
    tomorrow: {
      type: Boolean,
      default: false
    }
  }
});

Event.method({ asString });
Event.plugin(findOrCreate);

module.exports = mongoose.model('Event', Event);
