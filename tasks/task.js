#!/usr/bin/env node

var async = require('async');
var mongoose = require('mongoose');
require('../models/event')();
var Event = mongoose.model('Event');

var config = require('../settings/config');
var fetch = require('../lib/fetch');
var db = require('../lib/db');

async.parallel([
  function (callback) {
    // education
    fetch(config.resource.education, 'utf-8', function (err, res, $) {
      if (err) {
        return callback(err, []);
      }
      // make data object
      var events = [];
      var list = $('#news dd');
      list.each(function () {
        var data = {};
        // format data
        data.raw = $(this).find('.text').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：').trim();
        if (!/休講|補講|講義室変更/.test(data.raw)) { return; }
        data.about = data.raw.match(/【(\S*)】/)[1];
        data.link = 'http://' + res.request.host + ($(this).find('a').attr('href') || res.request.path);
        /*data.eventDate = new Date(new Date().getFullYear(), parseInt(data.raw.match(/】\s*(\d*)月/)[1]) - 1, parseInt(data.raw.match(/月\s*(\d*)日/)[1]), 0, 0);
        // check Day for next year
        if (['日', '月', '火', '水', '木', '金', '土', '日'][data.eventDate.getDay()] !== data.raw.match(/日\s*（(\S)）/)[1]) {
          console.log('wrn: next year event (maybe)');
          data.eventDate.setFullYear(data.eventDate.getFullYear() + 1);
        }*/
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
        //data.note = undefined;
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // insert to db
        events.push(data);
      });
      var tmpE = [];
      for (var i = 0; i < events.length; i++) {
        if (events[i].raw.match(/月\s*(\d*)日/)) {
          events[i].eventDate = new Date(new Date().getFullYear(), parseInt(events[i].raw.match(/】\s*(\d*)月/)[1]) - 1, parseInt(events[i].raw.match(/月\s*(\d*)日/)[1]), 0, 0);
          // check Day for next year
          if (['日', '月', '火', '水', '木', '金', '土', '日'][events[i].eventDate.getDay()] !== events[i].raw.match(/日\s*（(\S)）/)[1]) {
            console.log('wrn: next year event (maybe)');
            events[i].eventDate.setFullYear(events[i].eventDate.getFullYear() + 1);
          }
        } else {
          var tmp = events[i].raw;
          events[i].raw = tmp.replace(/[、､,，]\d*日/, '日');
          events[i].eventDate = new Date(new Date().getFullYear(), parseInt(events[i].raw.match(/】\s*(\d*)月/)[1]) - 1, parseInt(events[i].raw.match(/月\s*(\d*)日/)[1]), 0, 0);
          // check Day for next year
          if (['日', '月', '火', '水', '木', '金', '土', '日'][events[i].eventDate.getDay()] !== events[i].raw.match(/日\s*（(\S)）/)[1]) {
            console.log('wrn: next year event (maybe)');
            events[i].eventDate.setFullYear(events[i].eventDate.getFullYear() + 1);
          }
          events[i].hash = require('crypto').createHash('sha256').update(events[i].raw.replace(/\s/g, '')).digest('hex');
          var ne = JSON.parse(JSON.stringify(events[i]))
          ne.pubDate = new Date(ne.pubDate);
          ne.eventDate = new Date(ne.eventDate);
          tmpE.push();

          events[i].raw = tmp.replace(/月\s*\d*[、､,，]/, '月');
          events[i].eventDate = new Date(new Date().getFullYear(), parseInt(events[i].raw.match(/】\s*(\d*)月/)[1]) - 1, parseInt(events[i].raw.match(/月\s*(\d*)日/)[1]), 0, 0);
          // check Day for next year
          if (['日', '月', '火', '水', '木', '金', '土', '日'][events[i].eventDate.getDay()] !== events[i].raw.match(/日\s*（(\S)）/)[1]) {
            console.log('wrn: next year event (maybe)');
            events[i].eventDate.setFullYear(events[i].eventDate.getFullYear() + 1);
          }
          events[i].hash = require('crypto').createHash('sha256').update(events[i].raw.replace(/\s/g, '')).digest('hex');
        }
      }
      return callback(null, events.concat(tmpE));
    });
  }
  ,
  function (callback) {
    // literature
    fetch(config.resource.literature, 'SHIFT_JIS', function (err, res, $) {
      if (err) {
        return callback(err, []);
      }
      // make data object
      var events = [];
      var list = $('table tr:first-child table tr:not(:first-child)');
      list.each(function () {
        var data = {};
        // format data
        data.raw = $(this).text();
        data.about = $(this).find(':nth-child(2)').text().replace(/\s*/g, '');
        data.link = config.resource.literature;
        data.eventDate = $(this).find('[nowrap]').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/日|\s/g, '').split(/年|月/);
        data.eventDate = new Date(parseInt(data.eventDate[0]), parseInt(data.eventDate[1]) - 1, parseInt(data.eventDate[2]), 0, 0);
        data.pubDate = $(this).find(':nth-child(6)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/年|月/g, '-').replace(/日.*[\(|（]|分.*/g, ' ').replace(/時/g, ':').replace(/(^\s+)|(\s+$)/g, '');
        data.pubDate = new Date(data.pubDate);
        data.department = '文学部';
        data.subject = $(this).find(':nth-child(3)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/(^\s+)|(\s+$)/g, '');
        data.period = data.subject.match(/.*曜(\d*)限\s*(.*)/)[1];
        data.subject = data.subject.match(/限\s*(.*)$/)[1];
        data.teacher = $(this).find(':nth-child(4)').text().replace(/\s*/g, '');
        //data.campus = undefined;
        //data.room = undefined;
        //data.note = undefined;
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // insert to db
        events.push(data);
      });
      return callback(null, events);
    });
  }
  ,
  function (callback) {
    // law
    fetch(config.resource.law, 'SHIFT_JIS', function (err, res, $) {
      if (err) {
       return callback(err, []);
      }
      // make data object
      var events = [];
      var list = $('.article-main [style="height: 600px; overflow: auto;"] table tr:not(:first-child)');
      list.each(function () {
        var data = {};
        // format data
        data.raw = $(this).text();
        data.about = $(this).find(':nth-child(6)').text().replace(/\s*/g, '');
        if (data.about !== '補講') {
          data.about = '休講';
        }
        data.link = config.resource.law;
        data.eventDate = $(this).find(':nth-child(2)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/(^\s+)|(\s+$)/g, '').replace(/年|月/g, '-').replace(/日.*/, '');
        data.eventDate = new Date(data.eventDate);
        data.pubDate = $(this).find(':nth-child(5)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/年|月/g, '-').replace(/日\s*|分.*/g, ' ').replace(/時/g, ':').replace(/(^\s+)|(\s+$)/g, '');
        data.pubDate = new Date(data.pubDate);
        data.period = $(this).find(':nth-child(2)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/・/g, '').replace(/.*曜|限.*/g, '');
        data.department = '法学部';
        data.subject = $(this).find(':nth-child(3)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/(^\s+)|(\s+$)/g, '').replace(/U/g, 'II');
        data.teacher = $(this).find(':nth-child(4)').text().replace(/\s*/g, '');
        //data.campus = undefined;
        //data.room = undefined;
        data.note = $(this).find(':nth-child(7)').text().replace(/\s*/g, '');
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // insert to db
        events.push(data);
      });
      return callback(null, events);
    });
  }
  ,
  function (callback) {
    // science
    fetch(config.resource.science, 'SHIFT_JIS', function (err, res, $) {
      if (err) {
        return callback(err, []);
      }
      // make data object
      var list = $('table table table td.j12 table[width="100%"] tr');
      var datas = '';
      list.each(function () {
        datas += $(this).find('td').text();
      });
      if (!datas) {
        return callback(null, []);
      }
      datas = datas.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
      }, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：').trim().replace(/^\[\[/, '').split('[[ ');
      var events = [];
      for (var i = 0; i < datas.length; i++) {
        var data = {};
        data.raw = datas[i].trim();
        data.about = data.raw.match(/^(\S*)\s\]\]/)[1];
        data.link = 'http://www.sci.kyushu-u.ac.jp/index.php?type=0&sel1=11&sel2=0';
        data.eventDate = new Date(new Date().getFullYear(), parseInt(data.raw.match(/\]\]\s*(\d*)月/)[1]) - 1, parseInt(data.raw.match(/月\s*(\d*)日/)[1]), 0, 0);
        // check Day for next year
        if (['日', '月', '火', '水', '木', '金', '土', '日'][data.eventDate.getDay()] !== data.raw.match(/日\s*（(\S)）/)[1]) {
          console.log('wrn: next year event (maybe)');
          data.eventDate.setFullYear(data.eventDate.getFullYear() + 1);
        }
        data.period = data.raw.match(/）\s*(\S*)時限/)[1];
        data.department = '理学部' + data.raw.match(/学科：(\S*)\s*学年/)[1];
        data.subject = data.raw.match(/科目：(\S*.*\S)\s*（担当/)[1].replace(/\s/g, '');
        data.teacher = data.raw.match(/担当：(\S*\s*\S*)）/)[1].replace(/\s/g, '');
        //data.campus = undefined;
        //data.room = undefined;
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
      }
      return callback(null, events);
    });
  }
  ,
  function (callback) {
    // economics
    fetch(config.resource.economics, 'utf-8', function (err, res, $) {
      if (err) {
        return callback(err, []);
      }
      // make data object
      var events = [];
      var list = $('.box01 tr[bgcolor="#FFFFFF"]');
      list.each(function () {
        var data = {};
        // format data
        data.raw = $(this).find('a').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        }, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：').replace(/[○]/g, ' ').replace(/、|，/g, ',').trim();
        if (!/休講/.test(data.raw) && !/補講/.test(data.raw)) {
          return;
        }
        data.about = data.raw.match(/【(\S*)】/)[1];
        data.link = 'http://' + res.request.host + ($(this).find('a').attr('href') || res.request.path);
        data.eventDate = new Date(new Date().getFullYear(), data.raw.match(/】\s*(\d*)月/)[1] - 1, data.raw.match(/月\s*(\d*)日/)[1], 0, 0);
        // check Day for next year
        if (['日', '月', '火', '水', '木', '金', '土', '日'][data.eventDate.getDay()] !== data.raw.match(/日\s*（(\S)）/)[1]) {
          console.log('wrn: next year event (maybe)');
          data.eventDate.setFullYear(data.eventDate.getFullYear() + 1);
        }
        data.pubDate = new Date($(this).find('td[align="left"] + td[align="center"]').text());
        data.pubDate.setHours(data.pubDate.getHours() + new Date().getTimezoneOffset() / 60);
        // period [\d|：|～|~]*
        data.period = (/時限/.test(data.raw)) ? data.raw.match(/）\s*(\S*)時限/)[1] : data.raw.match(/）\s*(.*)(学部|学府)/)[1].trim();
        data.department = '経済学部';
        data.subject = data.raw.match(/「(.*)」/)[1];
        data.teacher = data.raw.match(/」\s*（(.*)教員）/)[1];
        //data.campus = undefined;
        //data.room = undefined;
        if (data.about === '補講') {
          data.room = data.raw.match(/教室：(.*)/)[1]
        }
        //data.note = undefined;
        data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
        // insert to db
        events.push(data);
      });
      return callback(null, events);
    });
  }
], function (err, results) {
  if (err) {
    console.log('err: fetch failed.');
    console.log('msg: %s', err);
  }
  // flatten
  var events = [];
  events = events.concat.apply(events, results);
  if (events.length == 0) {
    console.log('msg: no event found.')
    return;
  }
  //console.log(events)
  // find or create
  db.connect();
  async.each(events, function (event, eachCallback) {
    Event.findOrCreate({
      hash: event.hash
    }, event, function (err, event, created) {
      if (err) {
        console.log('err: findorcreate failed.');
        console.log('msg: %s', err);
        return eachCallback();
      }
      if (created) {
        console.log('msg: hash: %s save success.', event.hash);
      } else {
        console.log('msg: hash: %s already exist.', event.hash);
      }
      return eachCallback();
    });
  }, function (err) {
    return db.disconnect();
  });
});
