'use strict';

const moment = require('moment');

const createHash = require('../../utils/createhash');
const fetch = require('../../utils/fetch');
const normalizeText = require('../../utils/normalizetext');

const config = {
  resourceURL: 'http://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/class-schedule.cgi'
};

module.exports = () => {
  return fetch(config.resourceURL).then($ => {
    return $('table tr:first-child table tr:not(:first-child)').map((i, el) => {
      const $item = $(el);
      const data = {};
      const raw = $item.text();
      try {
        // format data
        data.raw = $item.text();
        data.about = $item.find(':nth-child(2)').text().replace(/\s*/g, '');
        data.link = config.resourceURL;
        const eventDate = moment(normalizeText($item.find('[nowrap]').text()), 'YYYY年M月D日');
        if (eventDate.isValid()) {
          data.eventDate = eventDate.toDate();
        } else {
          throw new Error('Invalid eventDate');
        }
        data.pubDate = moment(normalizeText($item.find(':nth-child(6)').text()), 'YYYY年M月D日h時m分').toDate();
        data.department = '文学部';
        data.subject = normalizeText($item.find(':nth-child(3)').text());
        data.period = data.subject.match(/.*曜(\d*)限\s*(.*)/)[1];
        data.subject = data.subject.match(/限\s*(.*)$/)[1];
        data.teacher = $item.find(':nth-child(4)').text().replace(/\s*/g, '');
        data.note = $item.find(':nth-child(5)').text().replace(/\s*/g, '');
        data.hash = createHash(raw);
        return data;
      } catch (err) {
        err.message += ' on ' + raw.replace(/[\f\n\r]/g, '');
        return err;
      }
    }).toArray();
  });
};
