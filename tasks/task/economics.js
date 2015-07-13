'use strict';

const util = require('./util');

const baseURL = 'http://www.econ.kyushu-u.ac.jp';
const resourcePath = '/student/kyuukou.php';

module.exports = function () {
  return util.fetch(baseURL + resourcePath, 'utf-8').then(function (result) {
    const $ = result[1];
    return $('.box01 tr[bgcolor="#FFFFFF"]').map(function () {
      const $item = $(this);
      const data = {};
      const raw = util.normalizeText($item.find('a').text()).replace(/、|，/g, ',');
      try {
        // format data
        data.raw = raw;
        if (!/休講/.test(raw) && !/補講/.test(raw)) {
          return;
        }
        data.about = raw.match(/[【|○](\S*)[】|○]/)[1];
        data.link = baseURL + ($item.find('a').attr('href') || resourcePath);
        data.eventDate = new Date(new Date().getFullYear(), raw.match(/[】|○]\s*(\d*)月/)[1] - 1, raw.match(/月\s*(\d*)日/)[1], 0, 0);
        // check if valid date
        if (!util.isValidDate(data.eventDate, raw.match(/日\s*\((\S)\)/)[1])) {
          throw new Error('Invalid eventDate');
        }
        data.pubDate = new Date($item.find('td[align="left"] + td[align="center"]').text());
        data.pubDate.setHours(data.pubDate.getHours() + new Date().getTimezoneOffset() / 60);
        data.period = /時限/.test(raw) ? raw.match(/\)\s*(\S*)時限/)[1] : raw.match(/\)\s*(.*)(学部|学府)/)[1].trim();
        data.department = '経済学部';
        data.subject = raw.match(/「(.*)」/)[1];
        data.teacher = raw.match(/」\s*\((.*)教員\)/)[1];
        if (/教室:/.test(raw)) {
          data.room = raw.match(/教室:(.*)/)[1];
        }
        data.hash = util.createHash(raw);
        return data; // eslint-disable-line consistent-return
      } catch (err) {
        err.message += ' on ' + raw.replace(/[\f\n\r]/g, '');
        return err; // eslint-disable-line consistent-return
      }
    }).toArray();
  });
};
