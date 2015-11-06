'use strict';

module.exports = [
  {
    raw: '[[ 休講 ]]\n                     10月 2日 (金)\n                     2時限\n                    \n                    学科:化学\n                     学年:2学年\n                    科目:subject1\n                     (担当:teacher1)',
    about: '休講',
    link: 'http://www.sci.kyushu-u.ac.jp/index.php?type=0&sel1=11&sel2=0',
    eventDate: new Date('2015-10-02T00:00+09:00'),
    period: '2',
    department: '理学部化学',
    subject: 'subject1',
    teacher: 'teacher1',
    hash: '7c9d127a88d52438ae7054f9c546137a97f396357487a57415dd20d018db7b5f'
  },
  {
    raw: '[[ 連絡 ]]\n                     10月 1日 (木)\n                     4時限\n                    \n                    学科:数学\n                     学年:2学年\n                    科目:subject2\n                     (担当:teacher2)\n                    連絡事項:note2\n                    教室:room2',
    about: '連絡',
    link: 'http://www.sci.kyushu-u.ac.jp/index.php?type=0&sel1=11&sel2=0',
    eventDate: new Date('2015-10-01T00:00+09:00'),
    period: '4',
    department: '理学部数学',
    subject: 'subject2',
    teacher: 'teacher2',
    room: 'room2',
    note: 'note2',
    hash: 'e005f8ae30f4bea572c0e9fd14df0dbe31b4c73a7a7e15e0dd722f7262046fcf'
  },
  new Error('Invalid eventDate on [[ 休講 ]]                     10月 6日 (水)                     4時限                                        学科:数学                     学年:4学年                    科目:subject3                     (担当:subject3)')
];
