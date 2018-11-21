'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');

const departmentList = [
  '教育学部',
  '文学部',
  '法学部',
  '理学部'
];

module.exports = departmentList.map(department => {
  const text = 'test data: department';
  return {
    about: text,
    campus: text,
    department,
    eventDate: baseDate.toDate(),
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
  };
});
