'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');
const text = 'test data 2';

module.exports = {
  raw: 'a',
  about: text,
  link: text,
  eventDate: baseDate.toDate(),
  period: '1',
  department: text,
  subject: text,
  teacher: text,
  campus: text,
  room: text,
  note: text,
  'tweet.new': true,
  'tweet.tomorrow': true
};
