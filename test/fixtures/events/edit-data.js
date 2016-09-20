'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');
const text = 'test data 2';

module.exports = {
  about: text,
  campus: text,
  department: text,
  eventDate: baseDate.toDate(),
  link: text,
  note: text,
  period: '1',
  raw: 'a',
  room: text,
  subject: text,
  teacher: text,
  'tweet.new': true,
  'tweet.tomorrow': true
};
