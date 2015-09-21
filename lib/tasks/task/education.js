'use strict';

const createHash = require('../../utils/createhash');
const fetch = require('../../utils/fetch');
const isValidDate = require('../../utils/isvaliddate');
const normalizeText = require('../../utils/normalizetext');

const config = {
  baseURL: 'http://www.education.kyushu-u.ac.jp',
  resourcePath: '/topics/student_index'
};

module.exports = () => {
  return fetch(config.baseURL + config.resourcePath, 'utf-8').then($ => {
    return $('#news dd').map((i, el) => {
      const $item = $(el);
      const data = {};
      const raw = normalizeText($item.find('.text').text());
      try {
        // format data
        data.raw = raw;
        if (!/休講|補講|講義室変更/.test(raw)) {
          return;
        }
        data.about = raw.match(/【(\S*)】/)[1];
        data.link = config.baseURL + ($item.find('a').attr('href') || config.resourcePath);
        data.eventDate = new Date(new Date().getFullYear(), parseInt(raw.match(/】\s*(\d*)月/)[1], 10) - 1, parseInt(raw.match(/月\s*(\d*)日/)[1], 10), 0, 0);
        // check if valid date
        if (!isValidDate(data.eventDate, raw.match(/日\s*\((\S)\)/)[1])) {
          throw new Error('Invalid eventDate');
        }
        data.pubDate = new Date($item.find('.date').text().replace(/\//g, '-'));
        data.pubDate.setHours(data.pubDate.getHours() + new Date().getTimezoneOffset() / 60);
        data.period = raw.match(/\)\s*(\S*)限/)[1];
        data.period = data.period.replace('時', '');
        data.department = '教育学部';
        data.subject = raw.match(/「(.*)」/)[1];
        data.teacher = raw.match(/」\s*\((.*)教員\)/)[1];
        if (/地区開講/.test(raw)) {
          data.campus = raw.match(/限\s*(\S*)開講/)[1];
        }
        if (/教室/.test(raw)) {
          data.room = raw.match(/教室:(.*)/)[1];
        }
        data.hash = createHash(raw);
        return data; // eslint-disable-line consistent-return
      } catch (err) {
        err.message += ' on ' + raw.replace(/[\f\n\r]/g, '');
        return err; // eslint-disable-line consistent-return
      }
    }).toArray();
  });
};
