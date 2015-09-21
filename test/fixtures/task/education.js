'use strict';

const config = require('../config');

module.exports = [
  new Error('Invalid eventDate on 【補講】7月10日(木)4限 「subject4」(teacher4教員)'),
  {
    raw: '【補講】6月15日(月)2、3限 「subject3」(teacher3教員) 教室:room3',
    about: '補講',
    link: config.localhost + '/education.html',
    eventDate: new Date('2015-06-15T00:00+09:00'),
    pubDate: new Date('2015-05-25T00:00+09:00'),
    period: '2、3',
    department: '教育学部',
    subject: 'subject3',
    teacher: 'teacher3',
    room: 'room3',
    hash: '1bbe968a54e7bab2704381c0bca3ff15ee7fa248bd3240177175534f41b87755'
  },
  {
    raw: '【休講】6月2日(火)1限 campus2地区開講「subject2」(teacher2教員)',
    about: '休講',
    link: config.localhost + '/topics/student_view/2',
    eventDate: new Date('2015-06-02T00:00+09:00'),
    pubDate: new Date('2015-05-15T00:00+09:00'),
    period: '1',
    department: '教育学部',
    subject: 'subject2',
    teacher: 'teacher2',
    campus: 'campus2地区',
    hash: '10f8551038c343c38a4fe6d65bb438a48995fbfdbd0c7f983010e0b9e371b6d0'
  }
];
