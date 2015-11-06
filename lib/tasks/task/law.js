'use strict';

const moment = require('moment');

const createHash = require('../../utils/createhash');
const fetch = require('../../utils/fetch');
const normalizeText = require('../../utils/normalizetext');

const config = {
  resourceURL: 'http://www.law.kyushu-u.ac.jp/kyukou/keiji.cgi'
};

module.exports = () => {
  return fetch(config.resourceURL).then($ => {
    return $('.article-main [style="height: 600px; overflow: auto;"] table tr:not(:first-child)').map((i, el) => {
      const $item = $(el);
      const data = {};
      const raw = $item.text();
      try {
        // format data
        data.raw = raw;
        data.about = $item.find(':nth-child(6)').text().replace(/\s*/g, '');
        if (data.about === '公務' || data.about === 'その他') {
          if (/\(補講\)$/.test($item.find(':nth-child(3)').text())) {
            data.about = '補講';
          }
        }
        data.link = config.resourceURL;
        const eventDate = moment(normalizeText($item.find(':nth-child(2)').text()).replace(/\(.*/, ''), 'YYYY年M月D日');
        if (eventDate.isValid()) {
          data.eventDate = eventDate.toDate();
        } else {
          throw new Error('Invalid eventDate');
        }
        data.pubDate = moment(normalizeText($item.find(':nth-child(5)').text()), 'YYYY年M月D日h時m分').toDate();
        data.period = normalizeText($item.find(':nth-child(2)').text())
          .replace(/・/g, '').replace(/.*曜|限.*/g, '');
        data.department = '法学部';
        data.subject = normalizeText($item.find(':nth-child(3)').text()).replace(/\(補講\)$/, '').replace(/U/g, 'II');
        data.teacher = $item.find(':nth-child(4)').text().replace(/\s*/g, '');
        data.note = $item.find(':nth-child(7)').text().replace(/\s*/g, '');
        data.hash = createHash(raw);
        return data;
      } catch (err) {
        err.message += ' on ' + raw.replace(/[\f\n\r]/g, '');
        return err;
      }
    }).toArray();
  });
};
