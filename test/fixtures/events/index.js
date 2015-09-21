'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');
const text = 'test data';

module.exports = {
  raw: 'a',
  about: text,
  link: text,
  eventDate: baseDate.toDate(),
  pubDate: baseDate.toDate(),
  period: '1',
  department: text,
  subject: text,
  teacher: text,
  campus: text,
  room: text,
  note: text,
  hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
  tweet: {
    new: false,
    tomorrow: false
  }
};
