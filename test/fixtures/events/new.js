'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'day').startOf('day');

const tweetNewList = [true, false];

module.exports = tweetNewList.map(flag => {
  const text = 'new';
  return {
    about: text,
    campus: text,
    department: text,
    eventDate: baseDate.toDate(),
    hash: text,
    link: text,
    note: moment().format(),
    period: '1',
    pubDate: baseDate.toDate(),
    raw: text,
    room: text,
    subject: text,
    teacher: text,
    tweet: {
      new: flag,
      tomorrow: false
    }
  };
});
