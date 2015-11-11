'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');
const text = 'test data';

module.exports = [
  {
    raw: text,
    about: text,
    link: text,
    eventDate: 'invalid date',
    pubDate: baseDate.toDate(),
    period: '1',
    department: text,
    subject: text,
    teacher: text,
    campus: text,
    room: text,
    note: text,
    tweet: {
      new: false,
      tomorrow: false
    }
  }
];
