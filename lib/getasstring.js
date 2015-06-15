function GetString (event) {
  event.datetime = (event.eventDate.getMonth() + 1) + '月' + event.eventDate.getDate() + '日（' + ['日', '月', '火', '水', '木', '金', '土'][event.eventDate.getDay()] + '）';
  event.fullsubject = '「' + event.subject;
  if (event.campus) {
    event.fullsubject += '（' + event.campus + '）';
  }
  event.fullsubject += '」';
  if (event.teacher) {
    event.fullsubject += '（' + event.teacher + '教員）';
  }
  event.baseText = '【' + event.about + '】' + event.datetime + '\n' +
                   event.department + event.period + '時限' + event.fullsubject + '\n';
  if (event.room) {
    event.baseText += '教室：' + event.room + '\n';
  }
  if (event.note) {
    event.baseText += '備考：' + event.note + '\n';
  }
  this.source = event;
}
GetString.prototype = {
  constructor: GetString,
  asNewTweet: function () {
    var event = this.source;
    return '新規：' + event.baseText;
  },
  asTomorrowTweet: function () {
    var event = this.source;
    return '明日：' + event.baseText;
  },
  asRSSTitle: function () {
    var event = this.source;
    var text = '【' + event.about + '】' + event.datetime + event.department + '「' + event.subject;
    if (event.campus) {
      text += '（' + event.campus + '）';
    }
    text += '」';
    return text;
  },
  asRSSDescription: function () {
    var event = this.source;
    var text = '【' + event.about + '】' + event.datetime + event.department + event.period + '時限' + event.fullsubject;
    if (event.room) {
      text += '；教室：' + event.room;
    }
    if (event.note) {
      text += '；備考：' + event.note;
    }
    return text;
  },
  asCalSummary: function () {
    var event = this.source;
    return '【' + event.about + '】' + event.period + '時限' + '\n' +
           event.fullsubject + '\n';
  },
  asCalDescription: function () {
    var event = this.source;
    var text = '【' + event.about + '】' + event.period + '時限' + '\n' +
               event.fullsubject + '\n';
    if (event.room) {
      text += '教室：' + event.room + '\n';
    }
    if (event.note) {
      text += '備考：' + event.note + '\n';
    }
    return text;
  }
};

module.exports = function (event) {
  return new GetString(event);
};
