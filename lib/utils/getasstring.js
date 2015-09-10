'use strict';

const GetString = class {
  constructor (event) {
    this.about = event.about;
    this.datetime = event.eventDate.getMonth() + 1 + '月' + event.eventDate.getDate() + '日（' + ['日', '月', '火', '水', '木', '金', '土'][event.eventDate.getDay()] + '）';
    this.department = event.department;
    this.period = event.period;
    this.subject = '「' + event.subject + (event.campus ? '（' + event.campus + '）' : '') + '」' + (event.teacher ? '（' + event.teacher + '教員）' : '');
    this.room = event.room;
    this.note = event.note;
    this.baseText = '【' + event.about + '】' + this.datetime + '\n' +
      event.department + event.period + '時限' + this.subject + '\n' +
      (event.room ? '教室：' + event.room + '\n' : '') +
      (event.note ? '備考：' + event.note + '\n' : '');
  }
  asNewTweet () {
    return '新規：' + this.baseText;
  }
  asTomorrowTweet () {
    return '明日：' + this.baseText;
  }
};

module.exports = event => {
  return new GetString(event);
};
