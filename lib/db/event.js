'use strict';

const moment = require('moment');
const mongoose = require('mongoose');

moment.locale('ja');

const Schema = mongoose.Schema;

const findOrCreate = require('./findorcreate');

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
const sevent = {
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
};

/**
 * @param {string} [format] - One of `title`, `summary`, `note`.
 * @param {string} [lineEnding] - Line ending code.
 * @return {string} event string.
 */
const asString = function (format, lineEnding) {
  if (typeof lineEnding !== 'string') {
    lineEnding = '\n';
  }
  const about = '【' + this.about + '】';
  const datetime = moment(this.eventDate).format('M月D日（dd）');
  const subject = '「' + this.subject + (this.campus ? '（' + this.campus + '）' : '') + '」' + (this.teacher ? '（' + this.teacher + '教員）' : '');
  const period = this.period + '時限';
  const note = [
    this.room ? '教室：' + this.room : '',
    this.note ? '備考：' + this.note : ''
  ].filter(str => str !== '').join(lineEnding);
  switch (format) {
    case 'title':
      return about + period + subject;
    case 'summary':
      return about + datetime + period + this.department + subject;
    case 'note':
      return note;
    default:
      return about + datetime + lineEnding +
        this.department + period + subject + (note !== '' ? lineEnding + note : '');
  }
};

module.exports = () => {
  const Event = new Schema(sevent);
  Event.method({ asString });
  Event.plugin(findOrCreate);
  mongoose.model('Event', Event);
};
