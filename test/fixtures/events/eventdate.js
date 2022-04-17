'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'days').startOf('day');

const eventDateList = [
  baseDate,
  moment(baseDate).add(2, 'years'),
  baseDate,
  moment(baseDate).add(1, 'days'),
  moment(baseDate).add(1, 'month'),
  baseDate,
  moment(baseDate).add(2, 'month'),
  moment(baseDate).add(2, 'days'),
  moment(baseDate).add(1, 'years')
];

module.exports = eventDateList.map(eventDate => {
  const text = 'test data: eventDate';
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
