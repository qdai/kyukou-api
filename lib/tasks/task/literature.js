'use strict';

const createHash = require('../../utils/createhash');
const fetch = require('../../utils/fetch');
const normalizeText = require('../../utils/normalizetext');

const resourceURL = 'http://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/class-schedule.cgi';

module.exports = () => {
  return fetch(resourceURL, 'SHIFT_JIS').then($ => {
    return $('table tr:first-child table tr:not(:first-child)').map((i, el) => {
      const $item = $(el);
      const data = {};
      const raw = $item.text();
      try {
        // format data
        data.raw = $item.text();
        data.about = $item.find(':nth-child(2)').text().replace(/\s*/g, '');
        data.link = resourceURL;
        data.eventDate = normalizeText($item.find('[nowrap]').text())
          .replace(/日|\s/g, '').split(/年|月/);
        data.eventDate = new Date(parseInt(data.eventDate[0], 10), parseInt(data.eventDate[1], 10) - 1, parseInt(data.eventDate[2], 10), 0, 0);
        data.pubDate = normalizeText($item.find(':nth-child(6)').text())
          .replace(/年|月/g, '-').replace(/日.*\(|分.*/g, ' ').replace(/時/g, ':');
        data.pubDate = new Date(data.pubDate);
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
