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
    raw: text,
    about: text,
    link: text,
    eventDate: eventDate.toDate(),
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
  };
});
