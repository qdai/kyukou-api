'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');

const departmentList = ['教育学部', '文学部', '法学部', '理学部', '経済学部'];

module.exports = departmentList.map(department => {
  const text = 'test data: department';
  return {
    raw: text,
    about: text,
    link: text,
    eventDate: baseDate.toDate(),
    pubDate: baseDate.toDate(),
    period: '1',
    department,
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
