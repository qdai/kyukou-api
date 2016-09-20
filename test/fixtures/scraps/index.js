'use strict';

const moment = require('moment');

const baseDate = moment().startOf('day');
const text = 'data';

module.exports = [
  {
    about: text,
    campus: text,
    department: text,
    eventDate: moment(baseDate).add(1, 'days').toDate(),
    hash: text,
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
