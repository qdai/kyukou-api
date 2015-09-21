'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'day').startOf('day');

const tweetNewList = [
  true,
  false
];

module.exports = tweetNewList.map(flag => {
  const text = 'new';
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
    note: text,
    hash: text,
    tweet: {
      new: flag,
      tomorrow: false
    }
  };
});
