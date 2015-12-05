'use strict';

const moment = require('moment');

const baseDate = moment().startOf('day');
const text = 'data';

module.exports = [
  {
    raw: text,
    about: text,
    link: text,
    eventDate: moment(baseDate).add(1, 'days').toDate(),
    pubDate: baseDate.toDate(),
    period: '1',
    department: text,
    subject: text,
    teacher: text,
    campus: text,
    room: text,
    note: text,
    hash: text,
    tweet: {
      new: false,
      tomorrow: false
    }
  }
];
