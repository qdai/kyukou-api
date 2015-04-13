var BBPromise = require('bluebird');

var fetch = require('../lib/fetch');
var getConnection = require('../db');

/*
 * zenkeku to hankaku
 * replace below:
 * ！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？
 * ＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＺＸＹＺ［＼］＾＿
 * ｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｚｘｙｚ｛｜｝～
 * 　
 */
function normalizeText(text) {
  return text.replace(/[\uff01-\uff5e]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 65248);
  }).replace(/\u3000/g, '\u0020').trim();
}

function isValidDate(date, youbi) {
  return ['日', '月', '火', '水', '木', '金', '土', '日'][date.getDay()] === youbi;
}

function createHash(raw) {
  return require('crypto').createHash('sha256').update(raw.replace(/\s/g, '')).digest('hex');
}

function getEducation () {
  var baseURL = 'http://www.education.kyushu-u.ac.jp';
  var resourcePath = '/topics/student_index';
  function makeEventData ($item) {
    var data = {};
    // format data
    data.raw = normalizeText($item.find('.text').text());
    if (!/休講|補講|講義室変更/.test(data.raw)) { return; }
    data.about = data.raw.match(/【(\S*)】/)[1];
    data.link = baseURL + ($item.find('a').attr('href') || resourcePath);
    data.eventDate = new Date(new Date().getFullYear(), parseInt(data.raw.match(/】\s*(\d*)月/)[1], 10) - 1, parseInt(data.raw.match(/月\s*(\d*)日/)[1], 10), 0, 0);
    // check if valid date
    if (!isValidDate(data.eventDate, data.raw.match(/日\s*\((\S)\)/)[1])) {
      throw new Error('Invalid eventDate');
    }
    data.pubDate = new Date($item.find('.date').text().replace(/\//g, '-'));
    data.pubDate.setHours(data.pubDate.getHours() + new Date().getTimezoneOffset() / 60);
    data.period = data.raw.match(/\)\s*(\S*)限/)[1];
    data.period = data.period.replace('時', '');
    data.department = '教育学部';
    data.subject = data.raw.match(/「(.*)」/)[1];
    data.teacher = data.raw.match(/」\s*\((.*)教員\)/)[1];
    if (/地区開講/.test(data.raw)) {
      data.campus = data.raw.match(/限\s*(\S*)開講/)[1];
    }
    if (/教室/.test(data.raw)) {
      data.room = data.raw.match(/教室:(.*)/);
    }
    data.hash = createHash(data.raw);
    return data;
  }
  return fetch(baseURL + resourcePath, 'utf-8').spread(function (res, $) {
    var event;
    var events = [];
    $('#news dd').each(function () {
      try {
        event = makeEventData($(this));
        if (event) {
          events.push(event);
        }
      } catch (err) {
        events.push(new Error(err.message + ' on ' + normalizeText($(this).find('.text').text()).replace(/[\f\n\r]/g, '')));
      }
    });
    return events;
  });
}

function getLiterature () {
  var resourceURL = 'http://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/class-schedule.cgi';
  function makeEventData ($item) {
    var data = {};
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
    data.hash = createHash(data.raw);
    return data;
  }
  return fetch(resourceURL, 'SHIFT_JIS').spread(function (res, $) {
    var event;
    var events = [];
    $('table tr:first-child table tr:not(:first-child)').each(function () {
      try {
        event = makeEventData($(this));
        if (event) {
          events.push(event);
        }
      } catch (err) {
        events.push(new Error(err.message + ' on ' + $(this).text().replace(/[\f\n\r]/g, '')));
      }
    });
    return events;
  });
}

function getLaw () {
  var resourceURL = 'http://www.law.kyushu-u.ac.jp/kyukou/keiji.cgi';
  function makeEventData ($item) {
    var data = {};
    // format data
    data.raw = $item.text();
    data.about = $item.find(':nth-child(6)').text().replace(/\s*/g, '');
    data.link = resourceURL;
    data.eventDate = normalizeText($item.find(':nth-child(2)').text())
      .replace(/\s/g, '').match(/(\d*)年(\d*)月(\d*)日/);
    data.eventDate = new Date(parseInt(data.eventDate[1], 10), parseInt(data.eventDate[2], 10) - 1, parseInt(data.eventDate[3], 10), 0, 0);
    data.pubDate = normalizeText($item.find(':nth-child(5)').text())
      .replace(/年|月/g, '-').replace(/日\s*|分.*/g, ' ').replace(/時/g, ':');
    data.pubDate = new Date(data.pubDate);
    data.period = normalizeText($item.find(':nth-child(2)').text())
      .replace(/・/g, '').replace(/.*曜|限.*/g, '');
    data.department = '法学部';
    data.subject = normalizeText($item.find(':nth-child(3)').text()).replace(/U/g, 'II');
    data.teacher = $item.find(':nth-child(4)').text().replace(/\s*/g, '');
    data.note = $item.find(':nth-child(7)').text().replace(/\s*/g, '');
    data.hash = createHash(data.raw);
    return data;
  }
  return fetch(resourceURL, 'SHIFT_JIS').spread(function (res, $) {
    var event;
    var events = [];
    $('.article-main [style="height: 600px; overflow: auto;"] table tr:not(:first-child)').each(function () {
      try {
        event = makeEventData($(this));
        if (event) {
          events.push(event);
        }
      } catch (err) {
        events.push(new Error(err.message + ' on ' + $(this).text().replace(/[\f\n\r]/g, '')));
      }
    });
    return events;
  });
}

function getScience () {
  var baseURL = 'http://www.sci.kyushu-u.ac.jp';
  var resourceURL = baseURL + '/home/cancel/cancel.php';
  var linkURL = baseURL + '/index.php?type=0&sel1=11&sel2=0';
  function makeEventData (item) {
    var data = {};
    data.raw = item.trim();
    data.about = data.raw.match(/^(\S*)\s\]\]/)[1];
    data.link = linkURL;
    data.eventDate = new Date(new Date().getFullYear(), parseInt(data.raw.match(/\]\]\s*(\d*)月/)[1], 10) - 1, parseInt(data.raw.match(/月\s*(\d*)日/)[1], 10), 0, 0);
    // check if valid date
    if (!isValidDate(data.eventDate, data.raw.match(/日\s*\((\S)\)/)[1])) {
      throw new Error('Invalid eventDate');
    }
    data.period = data.raw.match(/\)\s*(\S*)時限/)[1];
    data.department = '理学部' + data.raw.match(/学科:(\S*)\s*学年/)[1];
    data.subject = data.raw.match(/科目:(\S*.*\S)\s*\(担当/)[1].replace(/\s/g, '');
    data.teacher = data.raw.match(/担当:(\S*\s*\S*)\)/)[1].replace(/\s/g, '');
    if (/連絡事項:/.test(data.raw)) {
      data.note = data.raw.match(/連絡事項:(\S*)/)[1];
    } else if (data.about === '教室変更') {
      data.note = data.raw.match(/教室:(\S*)/)[1];
    }
    //modify raw
    data.raw = '[[ ' + data.raw;
    data.hash = createHash(data.raw);
    return data;
  }
  return fetch(resourceURL, 'SHIFT_JIS').spread(function (res, $) {
    var items = '';
    $('table table table td.j12 table[width="100%"] tr').each(function () {
      items += $(this).find('td').text();
    });
    if (!items) {
      return [];
    }
    items = normalizeText(items)
      .replace(/^\[\[/, '').split('[[ ');
    var event;
    var events = [];
    for (var i = 0; i < items.length; i++) {
      try {
        event = makeEventData(items[i]);
        if (event) {
          events.push(event);
        }
      } catch (err) {
        events.push(new Error(err.message + ' on ' + items[i].trim().replace(/[\f\n\r]/g, '')));
      }
    }
    return events;
  });
}

function getEconomics () {
  var baseURL = 'http://www.econ.kyushu-u.ac.jp';
  var resourcePath = '/student/kyuukou.php';
  function makeEventData ($item) {
    var data = {};
    // format data
    data.raw = normalizeText($item.find('a').text())
      .replace(/、|，/g, ',');
    if (!/休講/.test(data.raw) && !/補講/.test(data.raw)) {
      return;
    }
    data.about = data.raw.match(/[【|○](\S*)[】|○]/)[1];
    data.link = baseURL + ($item.find('a').attr('href') || resourcePath);
    data.eventDate = new Date(new Date().getFullYear(), data.raw.match(/[】|○]\s*(\d*)月/)[1] - 1, data.raw.match(/月\s*(\d*)日/)[1], 0, 0);
    // check if valid date
    if (!isValidDate(data.eventDate, data.raw.match(/日\s*\((\S)\)/)[1])) {
      throw new Error('Invalid eventDate');
    }
    data.pubDate = new Date($item.find('td[align="left"] + td[align="center"]').text());
    data.pubDate.setHours(data.pubDate.getHours() + new Date().getTimezoneOffset() / 60);
    data.period = (/時限/.test(data.raw)) ? data.raw.match(/\)\s*(\S*)時限/)[1] : data.raw.match(/\)\s*(.*)(学部|学府)/)[1].trim();
    data.department = '経済学部';
    data.subject = data.raw.match(/「(.*)」/)[1];
    data.teacher = data.raw.match(/」\s*\((.*)教員\)/)[1];
    if (/教室:/.test(data.raw)) {
      data.room = data.raw.match(/教室:(.*)/)[1];
    }
    data.hash = createHash(data.raw);
    return data;
  }
  return fetch(baseURL + resourcePath, 'utf-8').spread(function (res, $) {
    var event;
    var events = [];
    $('.box01 tr[bgcolor="#FFFFFF"]').each(function () {
      try {
        event = makeEventData($(this));
        if (event) {
          events.push(event);
        }
      } catch (err) {
        events.push(new Error(err.message + ' on ' + normalizeText($(this).find('a').text())
          .replace(/、|，/g, ',').replace(/[\f\n\r]/g, '')));
      }
    });
    return events;
  });
}

// get events
module.exports = function () {
  return BBPromise.all([getEducation(), getLiterature(), getLaw(), getScience(), getEconomics()]).then(function (results) {
    // flatten
    var events = [];
    events = events.concat.apply(events, results);
    // find or create
    return BBPromise.using(getConnection(), function (db) {
      var Event = db.model('Event');
      return BBPromise.all(events.map(function (event) {
        if (event instanceof Error) {
          return [event, null];
        }
        return new BBPromise(function (resolve) {
          Event.findOrCreate({
            hash: event.hash
          }, event, function (err, event, created) {
            if (err) {
              err.message += ' on ' + event.raw.replace(/[\f\n\r]/g, '');
              resolve([err, null]);
            } else {
              resolve([err, created]);
            }
          });
        });
      }));
    });
  }).then(function (results) {
    var log = '';
    var count = {
      created: 0,
      exist: 0
    };
    results.map(function (result) {
      var err = result[0];
      var created = result[1];
      if (err) {
        if (/ValidationError: Validator failed for path `eventDate`/.test(err.toString())) {
          log += 'inf: ' + err.message + '\n';
        } else if (/Error: Invalid eventDate/.test(err.toString())) {
          log += 'wrn: ' + err.message + '\n';
        } else {
          log += 'err: ' + err.message + '\n';
        }
      } else {
        if (created) {
          count.created++;
        } else {
          count.exist++;
        }
      }
    });
    log += 'msg: ' + count.created + ' event(s) created\n';
    log += 'msg: ' + count.exist + ' event(s) already exist';
    return log;
  });
};
