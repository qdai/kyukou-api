'use strict';

const config = require('../config');

module.exports = [
  new TypeError('Cannot read property \'1\' of null on           2015年10月1日（木）          休講          後期・通常              木曜invalid period              subject1          teacher1          note1          2015年9月8日(1時24分)        '),
  {
    raw: '\n          2015年10月1日（木）\n          休講\n          後期・通常\n              木曜2限\n              subject1\n          teacher1\n          note1\n          2015年9月8日(1時24分)\n        ',
    about: '休講',
    link: config.localhost + '/literature.html',
    eventDate: new Date('2015-10-01T00:00+09:00'),
    pubDate: new Date('2015-09-08T01:24+09:00'),
    period: '2',
    department: '文学部',
    subject: 'subject1',
    teacher: 'teacher1',
    note: 'note1',
    hash: '648243d967317589544b086c23522e47b710f931342e3ee39043e5a7d883d4ac'
  }
];
