'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');

const periodList = [
  '1',
  '2',
  '2,3',
  '2,3,4',
  '2,3,5',
  '2,4',
  '2,4,5',
  '2,5',
  '3',
  '3-4',
  '3-5',
  '4',
  '5'
];

module.exports = periodList.map(period => {
  const text = 'test data: period';
  return {
    raw: text,
    about: text,
    link: text,
    eventDate: baseDate.toDate(),
    pubDate: baseDate.toDate(),
    period,
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
  };
});
