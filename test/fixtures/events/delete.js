'use strict';

const moment = require('moment');

const baseDate = moment().startOf('day');

const eventDateList = [
  moment(baseDate).subtract(2, 'days'),
  moment(baseDate).subtract(1, 'days'),
  moment(baseDate).subtract(1, 'days').add(1, 'hour'),
  baseDate,
  moment(baseDate).add(1, 'days')
];

module.exports = eventDateList.map(eventDate => {
  const text = 'test data: delete';
  return {
    about: text,
    campus: text,
    department: text,
    eventDate: eventDate.toDate(),
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
