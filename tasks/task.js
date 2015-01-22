#!/usr/bin/env node

var BBPromise = require('bluebird');

var fetch = require('../lib/fetch');
var getConnection = require('../db');

function getEducation () {
  return fetch('http://www.education.kyushu-u.ac.jp/topics/student_index', 'utf-8').spread(function (res, $) {
    // make data object
    var events = [];
    var list = $('#news dd');
    list.each(function () {
      try {
        var data = {};
        // format data
        data.raw = $(this).find('.text').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：').trim();
        if (!/休講|補講|講義室変更/.test(data.raw)) { return; }
        data.about = data.raw.match(/【(\S*)】/)[1];
        data.link = 'http://' + res.request.host + ($(this).find('a').attr('href') || res.request.path);
        data.eventDate = new Date(new Date().getFullYear(), parseInt(data.raw.match(/】\s*(\d*)月/)[1], 10) - 1, parseInt(data.raw.match(/月\s*(\d*)日/)[1], 10), 0, 0);
        // check if valid date
        if (['日', '月', '火', '水', '木', '金', '土', '日'][data.eventDate.getDay()] !== data.raw.match(/日\s*（(\S)）/)[1]) {
          throw new Error('Invalid eventDate');
        }
        data.pubDate = new Date($(this).find('.date').text().replace(/\//g, '-'));
        data.pubDate.setHours(data.pubDate.getHours() + new Date().getTimezoneOffset() / 60);
        data.period = data.raw.match(/）\s*(\S*)限/)[1];
        data.period = data.period.replace('時', '');
        data.department = '教育学部';
        data.subject = data.raw.match(/「(.*)」/)[1];
        data.teacher = data.raw.match(/」\s*（(.*)教員）/)[1];
        if (/地区開講/.test(data.raw)) {
          data.campus = data.raw.match(/限\s*(\S*)開講/)[1];
        }
        if (/教室/.test(data.raw)) {
          data.room = data.raw.match(/教室：(.*)/);
        }
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // add to events
        events.push(data);
      } catch (err) {
        events.push(new Error(err.message + ' on ' + data.raw.replace(/[\f\n\r]/g, '')));
      }
    });
    return events;
  });
}

function getLiterature () {
  return fetch('http://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/class-schedule.cgi', 'SHIFT_JIS').spread(function (res, $) {
    // make data object
    var events = [];
    var list = $('table tr:first-child table tr:not(:first-child)');
    list.each(function () {
      try {
        var data = {};
        // format data
        data.raw = $(this).text();
        data.about = $(this).find(':nth-child(2)').text().replace(/\s*/g, '');
        data.link = 'http://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/class-schedule.cgi';
        data.eventDate = $(this).find('[nowrap]').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/日|\s/g, '').split(/年|月/);
        data.eventDate = new Date(parseInt(data.eventDate[0], 10), parseInt(data.eventDate[1], 10) - 1, parseInt(data.eventDate[2], 10), 0, 0);
        data.pubDate = $(this).find(':nth-child(6)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/年|月/g, '-').replace(/日.*[\(|（]|分.*/g, ' ').replace(/時/g, ':').trim();
        data.pubDate = new Date(data.pubDate);
        data.department = '文学部';
        data.subject = $(this).find(':nth-child(3)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').trim();
        data.period = data.subject.match(/.*曜(\d*)限\s*(.*)/)[1];
        data.subject = data.subject.match(/限\s*(.*)$/)[1];
        data.teacher = $(this).find(':nth-child(4)').text().replace(/\s*/g, '');
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // add to events
        events.push(data);
      } catch (err) {
        events.push(new Error(err.message + ' on ' + data.raw.replace(/[\f\n\r]/g, '')));
      }
    });
    return events;
  });
}

function getLaw () {
  return fetch('http://www.law.kyushu-u.ac.jp/kyukou/keiji.cgi', 'SHIFT_JIS').spread(function (res, $) {
    // make data object
    var events = [];
    var list = $('.article-main [style="height: 600px; overflow: auto;"] table tr:not(:first-child)');
    list.each(function () {
      try {
        var data = {};
        // format data
        data.raw = $(this).text();
        data.about = $(this).find(':nth-child(6)').text().replace(/\s*/g, '');
        data.link = 'http://www.law.kyushu-u.ac.jp/kyukou/keiji.cgi';
        data.eventDate = $(this).find(':nth-child(2)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/\s/g, '').match(/(\d*)年(\d*)月(\d*)日/);
        data.eventDate = new Date(parseInt(data.eventDate[1], 10), parseInt(data.eventDate[2], 10) - 1, parseInt(data.eventDate[3], 10), 0, 0);
        data.pubDate = $(this).find(':nth-child(5)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/年|月/g, '-').replace(/日\s*|分.*/g, ' ').replace(/時/g, ':').trim();
        data.pubDate = new Date(data.pubDate);
        data.period = $(this).find(':nth-child(2)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/・/g, '').replace(/.*曜|限.*/g, '');
        data.department = '法学部';
        data.subject = $(this).find(':nth-child(3)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').trim().replace(/U/g, 'II');
        data.teacher = $(this).find(':nth-child(4)').text().replace(/\s*/g, '');
        data.note = $(this).find(':nth-child(7)').text().replace(/\s*/g, '');
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // add to events
        events.push(data);
      } catch (err) {
        events.push(new Error(err.message + ' on ' + data.raw.replace(/[\f\n\r]/g, '')));
      }
    });
    return events;
  });
}

function getScience () {
  return fetch('http://www.sci.kyushu-u.ac.jp/home/cancel/cancel.php', 'SHIFT_JIS').spread(function (res, $) {
    // make data object
    var list = $('table table table td.j12 table[width="100%"] tr');
    var datas = '';
    list.each(function () {
      datas += $(this).find('td').text();
    });
    if (!datas) {
      return [];
    }
    datas = datas.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：').trim().replace(/^\[\[/, '').split('[[ ');
    var events = [];
    for (var i = 0; i < datas.length; i++) {
      try {
        var data = {};
        data.raw = datas[i].trim();
        data.about = data.raw.match(/^(\S*)\s\]\]/)[1];
        data.link = 'http://www.sci.kyushu-u.ac.jp/index.php?type=0&sel1=11&sel2=0';
        data.eventDate = new Date(new Date().getFullYear(), parseInt(data.raw.match(/\]\]\s*(\d*)月/)[1], 10) - 1, parseInt(data.raw.match(/月\s*(\d*)日/)[1], 10), 0, 0);
        // check if valid date
        if (['日', '月', '火', '水', '木', '金', '土', '日'][data.eventDate.getDay()] !== data.raw.match(/日\s*（(\S)）/)[1]) {
          throw new Error('Invalid eventDate');
        }
        data.period = data.raw.match(/）\s*(\S*)時限/)[1];
        data.department = '理学部' + data.raw.match(/学科：(\S*)\s*学年/)[1];
        data.subject = data.raw.match(/科目：(\S*.*\S)\s*（担当/)[1].replace(/\s/g, '');
        data.teacher = data.raw.match(/担当：(\S*\s*\S*)）/)[1].replace(/\s/g, '');
        if (/連絡事項：/.test(data.raw)) {
          data.note = data.raw.match(/連絡事項：(\S*)/)[1];
        } else if (data.about === '教室変更') {
          data.note = data.raw.match(/教室：(\S*)/)[1];
        }
        //modify raw
        data.raw = '[[ ' + data.raw;
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // add to events
        events.push(data);
      } catch (err) {
        events.push(new Error(err.message + ' on ' + data.raw.replace(/[\f\n\r]/g, '')));
      }
    }
    return events;
  });
}

function getEconomics () {
  return fetch('http://www.econ.kyushu-u.ac.jp/student/kyuukou.php', 'utf-8').spread(function (res, $) {
    // make data object
    var events = [];
    var list = $('.box01 tr[bgcolor="#FFFFFF"]');
    list.each(function () {
      try {
        var data = {};
        // format data
        data.raw = $(this).find('a').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：').replace(/、|，/g, ',').trim();
        if (!/休講/.test(data.raw) && !/補講/.test(data.raw)) {
          return;
        }
        data.about = data.raw.match(/[【|○](\S*)[】|○]/)[1];
        data.link = 'http://' + res.request.host + ($(this).find('a').attr('href') || res.request.path);
        data.eventDate = new Date(new Date().getFullYear(), data.raw.match(/[】|○]\s*(\d*)月/)[1] - 1, data.raw.match(/月\s*(\d*)日/)[1], 0, 0);
        // check if valid date
        if (['日', '月', '火', '水', '木', '金', '土', '日'][data.eventDate.getDay()] !== data.raw.match(/日\s*（(\S)）/)[1]) {
          throw new Error('Invalid eventDate');
        }
        data.pubDate = new Date($(this).find('td[align="left"] + td[align="center"]').text());
        data.pubDate.setHours(data.pubDate.getHours() + new Date().getTimezoneOffset() / 60);
        data.period = (/時限/.test(data.raw)) ? data.raw.match(/）\s*(\S*)時限/)[1] : data.raw.match(/）\s*(.*)(学部|学府)/)[1].trim();
        data.department = '経済学部';
        data.subject = data.raw.match(/「(.*)」/)[1];
        data.teacher = data.raw.match(/」\s*（(.*)教員）/)[1];
        if (/教室：/.test(data.raw)) {
          data.room = data.raw.match(/教室：(.*)/)[1];
        }
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // add to events
        events.push(data);
      } catch (err) {
        events.push(new Error(err.message + ' on ' + data.raw.replace(/[\f\n\r]/g, '')));
      }
    });
    return events;
  });
}

var task = function () {
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
    var created = 0;
    var exist = 0;
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
          created++;
        } else {
          exist++;
        }
      }
    });
    log += 'msg: ' + created + ' event(s) created\n';
    log += 'msg: ' + exist + ' event(s) already exist';
    return log;
  });
};

module.exports = task;

if (require.main === module) {
  task().catch(function (err) {
    return err.stack;
  }).then(function (msg) {
    console.log(msg);
  });
}
