'use strict';

const moment = require('moment');

moment.locale('ja');

/**
 * @this event
 * @param {string} [format] - One of `title`, `summary`, `note`.
 * @param {string} [lineEnding] - Line ending code.
 * @return {string} event string.
 */
const asString = function (format, lineEnding) {
  if (typeof lineEnding !== 'string') {
    lineEnding = '\n';
  }
  const about = '【' + this.about + '】';
  const datetime = moment(this.eventDate).format('M月D日（dd）');
  const subject = '「' + this.subject + (this.campus ? '（' + this.campus + '）' : '') + '」' + (this.teacher ? '（' + this.teacher + '教員）' : '');
  const period = this.period + '時限';
  const note = [
    this.room ? '教室：' + this.room : '',
    this.note ? '備考：' + this.note : ''
  ].filter(str => str !== '').join(lineEnding);
  switch (format) {
    case 'title':
      return about + period + subject;
    case 'summary':
      return about + datetime + period + this.department + subject;
    case 'note':
      return note;
    default:
      return about + datetime + lineEnding +
        this.department + period + subject + (note !== '' ? lineEnding + note : '');
  }
};

module.exports = asString;
