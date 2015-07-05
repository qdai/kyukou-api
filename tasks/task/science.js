var util = require('./util');

var baseURL = 'http://www.sci.kyushu-u.ac.jp';
var resourceURL = baseURL + '/home/cancel/cancel.php';
var linkURL = baseURL + '/index.php?type=0&sel1=11&sel2=0';

module.exports = function () {
  return util.fetch(resourceURL, 'SHIFT_JIS').spread(function (res, $) {
    var items = $('table table table td.j12 table[width="100%"] tr td').text();
    if (!items) {
      return [];
    } else {
      return util.normalizeText(items).replace(/^\[\[/, '').split('[[ ').map(function (item) {
        var data = {};
        var raw = '[[ ' + item.trim();
        try {
          data.raw = raw;
          data.about = raw.match(/\[\[\s(\S*)\s\]\]/)[1];
          data.link = linkURL;
          data.eventDate = new Date(new Date().getFullYear(), parseInt(raw.match(/\]\]\s*(\d*)月/)[1], 10) - 1, parseInt(raw.match(/月\s*(\d*)日/)[1], 10), 0, 0);
          // check if valid date
          if (!util.isValidDate(data.eventDate, raw.match(/日\s*\((\S)\)/)[1])) {
            throw new Error('Invalid eventDate');
          }
          data.period = raw.match(/\)\s*(\S*)時限/)[1];
          data.department = '理学部' + raw.match(/学科:(\S*)\s*学年/)[1];
          data.subject = raw.match(/科目:(\S*.*\S)\s*\(担当/)[1].replace(/\s/g, '');
          data.teacher = raw.match(/担当:(.*)\)/)[1].replace(/\s/g, '');
          if (/連絡事項:/.test(raw)) {
            data.note = raw.match(/連絡事項:(\S*)/)[1];
          } else if (data.about === '教室変更') {
            data.note = raw.match(/教室:(\S*)/)[1];
          }
          data.hash = util.createHash(raw);
          return data;
        } catch (err) {
          err.message += 'on' + raw.replace(/[\f\n\r]/g, '');
          return err;
        }
      });
    }
  });
};
