'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');
const text = 'test data 2';

module.exports = {
  about: text,
  campus: text,
  department: text,
  eventDate: baseDate.toDate(),
  hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
  link: text,
  note: text,
  period: '1',
  pubDate: baseDate.toDate(),
  raw: 'a',
  room: text,
  subject: text,
  teacher: text,
  tweet: {
    new: true,
    tomorrow: true
  }
};
