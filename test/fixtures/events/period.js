'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');

const periodList = [
  '1',
  '3-5',
  '3',
  '2,3',
  '2',
  '3-4',
  '2,3,4',
  '2,4',
  '2,4,5',
  '2,3,5',
  '2,5',
  '4',
  '5'
];

module.exports = periodList.map(period => {
  const text = 'test data: period';
  return {
    about: text,
    campus: text,
    department: text,
    eventDate: baseDate.toDate(),
    hash: text,
    link: text,
    note: text,
    period,
    pubDate: baseDate.toDate(),
    raw: text,
    room: text,
    subject: text,
    teacher: text,
    tweet: {
      new: false,
      tomorrow: false
    }
  };
});
