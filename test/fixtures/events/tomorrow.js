'use strict';

const moment = require('moment');

const baseDate = moment().add(1, 'day').startOf('day');

const tweetTomorrowList = [true, false];

module.exports = tweetTomorrowList.map(flag => {
  const text = 'tomorrow';
  return {
    about: text,
    campus: text,
    department: text,
    eventDate: baseDate.toDate(),
    hash: text,
    link: text,
    note: `${moment().format()} ${text}\n`.repeat(5),
    period: '1',
    pubDate: baseDate.toDate(),
    raw: text,
    room: text,
    subject: text,
    teacher: text,
    tweet: {
      new: false,
      tomorrow: flag
    }
  };
});
