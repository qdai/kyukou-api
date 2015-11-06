'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');

const eventDateList = [
  baseDate,
  baseDate,
  baseDate,
  moment(baseDate).add(1, 'days'),
  moment(baseDate).add(2, 'days'),
  moment(baseDate).add(1, 'month'),
  moment(baseDate).add(2, 'month'),
  moment(baseDate).add(1, 'years'),
  moment(baseDate).add(2, 'years')
];

module.exports = eventDateList.map(eventDate => {
  const text = 'test data: eventDate';
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
