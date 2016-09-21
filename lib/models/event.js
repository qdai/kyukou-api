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
 * @property {Date} eventDate - Event date.
 * @property {string} hash - Event ID.
 * @property {string} link - Event URL.
 * @property {string} period - Event period.
 * @property {Date} pubDate - Date the event published.
 * @property {string} raw - Event source.
 * @property {string} subject - Subject.
 * @property {Object} tweet - Tweet flags.
 * @property {boolean} tweet.new - New or not.
 * @property {boolean} tweet.tomorrow - Tomorrow or not.
 * @property {string} [campus] - Campus.
 * @property {string} [note] - Notes.
 * @property {string} [room] - Room.
 * @property {string} [teacher] - Teacher.
 *
 * @example
 * {
 *   "about": "休講",
 *   "department": "教育学部",
 *   "eventDate": "2015-01-18T15:00:00.000Z",
 *   "hash": "89c5918f7d1decffcfd72eebec6413ac7f3795d71f335bd97129df0c69818e8f",
 *   "link": "http://www.education.kyushu-u.ac.jp/topics/student_index",
 *   "period": "1",
 *   "pubDate": "2015-01-15T15:00:00.000Z",
 *   "raw": "【休講】1月19日（月） 1限 「教科名」（教員名教員）",
 *   "subject": "教科名",
 *   "tweet": {
 *     "tomorrow": true,
 *     "new": true
 *   },
 *   "teacher": "教員名"
 * }
 */
const Event = new Schema({
  about: {
    required: true,
    type: String
  },
  campus: {
    type: String
  },
  department: {
    required: true,
    type: String
  },
  eventDate: {
    required: true,
    type: Date,
    validate (value) {
      const eventDate = moment(value);
      const date = moment().subtract(18, 'hours');
      return !eventDate.isBefore(date);
    }
  },
  hash: {
    required: true,
    type: String
  },
  link: {
    required: true,
    type: String
  },
  note: {
    type: String
  },
  period: {
    required: true,
    type: String
  },
  pubDate: {
    default: new Date(),
    type: Date
  },
  raw: {
    required: true,
    type: String
  },
  room: {
    type: String
  },
  subject: {
    required: true,
    type: String
  },
  teacher: {
    type: String
  },
  tweet: {
    new: {
      default: false,
      type: Boolean
    },
    tomorrow: {
      default: false,
      type: Boolean
    }
  }
});

Event.method({ asString });
Event.plugin(findOrCreate);

module.exports = mongoose.model('Event', Event);
