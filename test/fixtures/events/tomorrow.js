'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'day').startOf('day');

const tweetTomorrowList = [
  true,
  false
];

module.exports = tweetTomorrowList.map(flag => {
  const text = 'tomorrow';
  return {
    raw: text,
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
    note: (text + ' ').repeat(10),
    hash: text,
    tweet: {
      new: false,
      tomorrow: flag
    }
  };
});
