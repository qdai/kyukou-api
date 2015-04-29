var util = require('./util');

var resourceURL = 'http://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/class-schedule.cgi';

module.exports = function () {
  return util.fetch(resourceURL, 'SHIFT_JIS').spread(function (res, $) {
    return $('table tr:first-child table tr:not(:first-child)').map(function () {
      var $item = $(this);
      var data = {};
      var raw = $item.text();
      try {
        // format data
        data.raw = $item.text();
        data.about = $item.find(':nth-child(2)').text().replace(/\s*/g, '');
        data.link = resourceURL;
        data.eventDate = util.normalizeText($item.find('[nowrap]').text())
          .replace(/日|\s/g, '').split(/年|月/);
        data.eventDate = new Date(parseInt(data.eventDate[0], 10), parseInt(data.eventDate[1], 10) - 1, parseInt(data.eventDate[2], 10), 0, 0);
        data.pubDate = util.normalizeText($item.find(':nth-child(6)').text())
          .replace(/年|月/g, '-').replace(/日.*\(|分.*/g, ' ').replace(/時/g, ':');
        data.pubDate = new Date(data.pubDate);
        data.department = '文学部';
        data.subject = util.normalizeText($item.find(':nth-child(3)').text());
        data.period = data.subject.match(/.*曜(\d*)限\s*(.*)/)[1];
        data.subject = data.subject.match(/限\s*(.*)$/)[1];
        data.teacher = $item.find(':nth-child(4)').text().replace(/\s*/g, '');
        data.note = $item.find(':nth-child(5)').text().replace(/\s*/g, '');
        data.hash = util.createHash(raw);
        return data;
      } catch (err) {
        err.message += 'on' + raw.replace(/[\f\n\r]/g, '');
        return err;
      }
    }).toArray();
  });
};
