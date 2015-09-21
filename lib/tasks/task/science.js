'use strict';

const createHash = require('../../utils/createhash');
const fetch = require('../../utils/fetch');
const isValidDate = require('../../utils/isvaliddate');
const normalizeText = require('../../utils/normalizetext');

const baseURL = 'http://www.sci.kyushu-u.ac.jp';
const config = {
  linkURL: baseURL + '/index.php?type=0&sel1=11&sel2=0',
  resourceURL: baseURL + '/home/cancel/cancel.php'
};

module.exports = () => {
  return fetch(config.resourceURL, 'SHIFT_JIS').then($ => {
    const items = $('table table table td.j12 table[width="100%"] tr td').text();
    if (!items) {
      return [];
    } else {
      return normalizeText(items).replace(/^\[\[/, '').split('[[ ').map(item => {
        const data = {};
        const raw = '[[ ' + item.trim();
        try {
          data.raw = raw;
          data.about = raw.match(/\[\[\s(\S*)\s\]\]/)[1];
          data.link = config.linkURL;
          data.eventDate = new Date(new Date().getFullYear(), parseInt(raw.match(/\]\]\s*(\d*)月/)[1], 10) - 1, parseInt(raw.match(/月\s*(\d*)日/)[1], 10), 0, 0);
          // check if valid date
          if (!isValidDate(data.eventDate, raw.match(/日\s*\((\S)\)/)[1])) {
            throw new Error('Invalid eventDate');
          }
          data.period = raw.match(/\)\s*(\S*)時限/)[1];
          data.department = '理学部' + raw.match(/学科:(\S*)\s*学年/)[1];
          data.subject = raw.match(/科目:(\S*.*\S)\s*\(担当/)[1].replace(/\s/g, '');
          data.teacher = raw.match(/担当:(.*)\)/)[1].replace(/\s/g, '');
          if (/連絡事項:/.test(raw)) {
            data.note = raw.match(/連絡事項:(\S*)/)[1];
          }
          if (/教室:/.test(raw)) {
            data.room = raw.match(/教室:(\S*)/)[1];
          }
          data.hash = createHash(raw);
          return data;
        } catch (err) {
          err.message += ' on ' + raw.replace(/[\f\n\r]/g, '');
          return err;
        }
      });
    }
  });
};
