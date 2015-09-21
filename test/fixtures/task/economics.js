'use strict';

const config = require('../config');

module.exports = [
  new Error('Invalid eventDate on 【休講】10月5日(火) 1時限 学府 「subject3」 (teacher3教員)'),
  {
    raw: '【休講】10月1日(木) 18:30~20:00 学部 「subject2」 (teacher2教員)',
    about: '休講',
    link: config.localhost + '/economics.html',
    eventDate: new Date('2015-10-01T00:00+09:00'),
    pubDate: new Date('2015-08-12T00:00+09:00'),
    period: '18:30~20:00',
    department: '経済学部',
    subject: 'subject2',
    teacher: 'teacher2',
    hash: 'a35b1a9ee65290c15fa0e819e608f61f256949d0553d8a6f3fa802a10243b342'
  },
  {
    raw: '【休講】10月5日(月) 4,5時限 学部 「subject1」 (teacher1教員)教室:room1',
    about: '休講',
    link: config.localhost + '/student/kyuukou_read.php?kind=&S_Category=C&S_View=&word=&page=1&B_Code=0001',
    eventDate: new Date('2015-10-05T00:00+09:00'),
    pubDate: new Date('2015-08-11T00:00+09:00'),
    period: '4,5',
    department: '経済学部',
    subject: 'subject1',
    teacher: 'teacher1',
    room: 'room1',
    hash: '61b74fdd44c6f60d8746ab9a846a7901f78dd8363b31b52d2a601825f3cb1fa8'
  }
];
