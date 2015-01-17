var twString = function (event, strType) {
  var text,
      datetime = (event.eventDate.getMonth() + 1) + '月'
               + event.eventDate.getDate() + '日（'
               + ['日', '月', '火', '水', '木', '金', '土'][event.eventDate.getDay()] + '）',
      subject = '「' + event.subject;
  if (event.campus) {
    subject += '（' + event.campus + '）';
  }
  subject += '」';
  if (event.teacher) {
    subject += '（' + event.teacher + '教員）';
  }

  switch (strType) {
    case 'twnew':
      text = '新規：【' + event.about + '】' + datetime + '\n'
           + event.department + event.period + '時限' + subject + '\n';
      if (event.room) {
        text += '教室：' + event.room + '\n';
      }
      if (event.note) {
        text += '備考：' + event.note + '\n';
      }
      break;
    case 'twtom':
      text = '明日：【' + event.about + '】' + datetime + '\n'
           + event.department + event.period + '時限' + subject + '\n';
      if (event.room) {
        text += '教室：' + event.room + '\n';
      }
      if (event.note) {
        text += '備考：' + event.note + '\n';
      }
      break;
    case 'rsttl':
      text = '【' + event.about + '】' + datetime
           + event.department + '「' + event.subject;
      if (event.campus) {
        text += '（' + event.campus + '）';
      }
      text += '」';
      break;
    case 'rstxt':
      text = '【' + event.about + '】' + datetime
           + event.department + event.period + '時限' + subject;
      if (event.room) {
        text += '；教室：' + event.room;
      }
      if (event.note) {
        text += '；備考：' + event.note;
      }
      break;
    default:
      text = event.raw;
  }
  return text;
};

module.exports = twString;
