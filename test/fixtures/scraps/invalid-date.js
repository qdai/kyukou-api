'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');
const text = 'test data';

module.exports = [
  {
    about: text,
    campus: text,
    department: text,
    eventDate: 'invalid date',
    link: text,
    note: text,
    period: '1',
    pubDate: baseDate.toDate(),
    raw: text,
    room: text,
    subject: text,
    teacher: text,
    tweet: {
      new: false,
      tomorrow: false
    }
  }
];
