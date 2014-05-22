#!/usr/bin/env node

// call if ((hour % 4) == 0)

var request = require('request');
var cheerio = require('cheerio');
var Sequelize = require('sequelize');
var config = require('../secret/config');

// connect to db
var sequelize = new Sequelize(config.db_database, config.db_user, config.db_password, {
  host: config.db_host
});

// defione main_data
var mainData = sequelize.define('main_data', {
  about: Sequelize.STRING,
  pubdate: Sequelize.DATE,
  date: Sequelize.DATE,
  text: Sequelize.STRING,
  link: Sequelize.STRING,
  period: Sequelize.STRING,
  department: Sequelize.STRING,
  course: Sequelize.STRING,
  grade: Sequelize.STRING,
  subject: Sequelize.STRING,
  teacher: Sequelize.STRING,
  campus: Sequelize.STRING,
  room: Sequelize.STRING,
});

// delete expired data
mainData.findAll({ where: ['date > ?', new Date().toString()] } ).success(function (datas) {
  console.log(datas.length);
  for (var i = 0; i < datas.length; i++) {
    datas[i].destroy().success(function () {
      console.log('destroy: success');
    }).error(function (err) {
      console.log('error on destroy: ' + err);
    });
  }
}).error(function (err) {
  console.log('error on findAll: ' + err);
});

// education
request({ url: 'http://www.sci.kyushu-u.ac.jp/home/cancel/cancel.php' }, function(err, res, body) {
  if (err || res.statusCode !== 200) {
    console.log('error on education: ' + err.stack);
    return;
  }
  var $ = cheerio.load(body);
  // make data object
  var list = $('#news dd');
  list.each(function () {
    var data = {};
    // format data
    data.text = $(this).find('.text').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/(^\s+)|(\s+$)/g, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：');
    if (!/休講|補講/.test(data.text)) { return; }
    if (/地区開講/.test(data.text) && /教室/.test(data.text)) {
      data.tmp = data.text.match(/.*【(.*)】\s*(\d.*).*月\s*(\d.*).*日.*（(.*)）\s*(\d.*)時限\s*(.*)地区.*「(.*)」.*（(.*)教員）.*教室：(.*)/);
    }　else if (/地区開講/.test(data.text)) {
      data.tmp = data.text.match(/.*【(.*)】\s*(\d.*).*月\s*(\d.*).*日.*（(.*)）\s*(\d.*)時限\s*(.*)地区.*「(.*)」.*（(.*)教員）.*/);
      data.tmp.splice(9, 0, null);
    } else if (/教室/.test(data.text)) {
      data.tmp = data.text.match(/.*【(.*)】\s*(\d.*).*月\s*(\d.*).*日.*（(.*)）\s*(\d.*)時限.*「(.*)」.*（(.*)教員）.*教室：(.*)/);
      data.tmp.splice(6, 0, null);
    } else {
      data.tmp = data.text.match(/.*【(.*)】\s*(\d.*).*月\s*(\d.*).*日.*（(.*)）\s*(\d.*)時限.*「(.*)」.*（(.*)教員）.*/);
      data.tmp.splice(6, 0, null);
      data.tmp.splice(9, 0, null);
    }
    data.about = data.tmp[1];
    data.date = new Date(new Date().getFullYear(), parseInt(data.tmp[2]) - 1, parseInt(data.tmp[3]), 9, 0);
    // check Day for next year
    var w = ['日','月','火','水','木','金','土'];
    if (w[data.date.getDay()] !== data.tmp[4]) {
      data.date = new Date(new Date().getFullYear() + 1, parseInt(data.tmp[2]) - 1, parseInt(data.tmp[3]), 9, 0);
    }
    if (data.date < new Date()) { return; }
    data.period = data.tmp[5];
    data.campus = data.tmp[6];
    data.subject = data.tmp[7];
    data.teacher = data.tmp[8];
    data.room = data.tmp[9];
    delete data.tmp;
    data.department = '教育';
    data.pubdate = $(this).find('.date').text().replace(/\//g, '-');
    data.link = 'http://' + res.request.host + ($(this).find('a').attr('href') || res.request.path);
    // findOrCreate on db dep_edu table
    mainData.findOrCreate({ text: data.text }, data).success(function (datas, created) {
      console.log('created: ' + created);
    }).error(function (err) {
      console.log('error: ' + err);
    });
  });
});

// economics
request({ url: 'http://www.econ.kyushu-u.ac.jp/student/kyuukou.php' }, function(err, res, body) {
  if (err || res.statusCode !== 200) {
    console.log('error on economics: ' + err.stack);
    return;
  }
  var $ = cheerio.load(body);
  // make data object
  var list = $('.box01 tr[bgcolor="#FFFFFF"]');
  list.each(function () {
    var data = {};
    // format data
    data.text = $(this).find('a').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/(^\s+)|(\s+$)/g, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：').replace(/[【|】 |○]/g, ' ').replace(/時限/, '').replace(/、|，/g, ',');
    if (/休講/.test(data.text)) {
      data.about = '休講';
      data.tmp = data.text.match(/.*\s(\d*)月(\d*)日（(\S*)）\s*(\S*)\s*(\S*)\s*「(.*)」\s*（(\S*)教員）.*/);
      data.tmp.splice(8, 0, null);
    } else if (/補講/.test(data.text)) {
      data.about = '補講';
      data.tmp = data.text.match(/.*\s(\d*)月(\d*)日（(\S*)）\s*([\d|：|～|~]*)\s*(\S*)\s*「(.*)」\s*（(\S*)教員）.*教室：(\S*)/);
    } else {
      return;
    }
    data.date = new Date(new Date().getFullYear(), parseInt(data.tmp[1]) - 1, parseInt(data.tmp[2]), 9, 0);
    // check Day for next year
    var w = ['日','月','火','水','木','金','土'];
    if (w[data.date.getDay()] !== data.tmp[3]) {
      data.date = new Date(new Date().getFullYear() + 1, parseInt(data.tmp[1]) - 1, parseInt(data.tmp[2]), 9, 0);
    }
    if (data.date < new Date()) { return; }
    data.period = (/：/.test(data.tmp[4]))? 7 : data.tmp[4];
    data.campus = null;
    data.subject = data.tmp[6];
    data.teacher = data.tmp[7];
    data.room = data.tmp[8];
    delete data.tmp;
    data.department = '経済';
    data.pubdate = $(this).find('td[align="left"] + td[align="center"]').text();
    data.link = 'http://' + res.request.host + ($(this).find('a').attr('href') || res.request.path);
    // findOrCreate on db dep_edu table
    mainData.findOrCreate({ text: data.text }, data).success(function (datas, created) {
      console.log('created: ' + created);
    }).error(function (err) {
      console.log('error: ' + err);
    });
  });
});

// literature
request({
  url: 'http://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/class-schedule.cgi',
  encoding: null
}, function(err, res, body) {
  if (err || res.statusCode !== 200) {
    console.log('error on literature: ' + err.stack);
    return;
  }
  // fix encoding
  var $ = cheerio.load(new require('iconv').Iconv('Shift_JIS', 'UTF-8//TRANSLIT//IGNORE').convert(body).toString());
  // make data object
  var list = $('table tr:first-child table tr:not(:first-child)');
  list.each(function () {
    var data = {};
    // format data
    data.date = $(this).find('[nowrap]').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/(^\s+)|(\s+$)/g, '').replace(/年|月/g, '-').replace(/日.*/, '');
    data.about = $(this).find(':nth-child(2)').text().replace(/\s*/g, '');
    data.subject = $(this).find(':nth-child(3)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/(^\s+)|(\s+$)/g, '');
    data.teacher = $(this).find(':nth-child(4)').text().replace(/\s*/g, '');
    data.pubdate = $(this).find(':nth-child(6)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/年|月/g, '-').replace(/日.*[\(|（]|分.*/g, ' ').replace(/時/g, ':').replace(/(^\s+)|(\s+$)/g, '');
    data.text = data.date + ';' + data.about + ';' + data.subject + ';' + data.teacher + ';' + data.pubdate;
    data.tmp = data.subject.match(/.*曜(\d*)限\s*(.*)/);
    data.period = data.tmp[1];
    data.subject = data.tmp[2];
    delete data.tmp;
    data.campus = null;
    data.department = '文';
    data.link = 'http://' + res.request.host + res.request.path;
    // findOrCreate on db dep_edu table
    mainData.findOrCreate({ text: data.text }, data).success(function (datas, created) {
      console.log('created: ' + created);
    }).error(function (err) {
      console.log('error: ' + err);
    });
  });
});

// law
request({
  url: 'http://www.law.kyushu-u.ac.jp/kyukou/keiji.cgi',
  encoding: null
}, function(err, res, body) {
  if (err || res.statusCode !== 200) {
    console.log('error on law: ' + err.stack);
    return;
  }
  // fix encoding
  //var $ = cheerio.load(body);
  var $ = cheerio.load(new require('iconv').Iconv('Shift_JIS', 'UTF-8//TRANSLIT//IGNORE').convert(body).toString());
  // make data object
  var list = $('.article-main [style="height: 600px; overflow: auto;"] table tr:not(:first-child)');
  list.each(function () {
    var data = {};
    // format data
    data.date = $(this).find(':nth-child(2)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/(^\s+)|(\s+$)/g, '').replace(/年|月/g, '-').replace(/日.*/, '');
    data.about = $(this).find(':nth-child(6)').text().replace(/\s*/g, '');
    if (data.about !== '補講') {
      data.about = '休講';
    }
    data.subject = $(this).find(':nth-child(3)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/(^\s+)|(\s+$)/g, '').replace(/U/g, 'II');
    data.teacher = $(this).find(':nth-child(4)').text().replace(/\s*/g, '');
    data.pubdate = $(this).find(':nth-child(5)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/年|月/g, '-').replace(/日\s*|分.*/g, ' ').replace(/時/g, ':').replace(/(^\s+)|(\s+$)/g, '');
    data.text = data.date + ';' + data.about + ';' + data.subject + ';' + data.teacher + ';' + data.pubdate;
    data.period = $(this).find(':nth-child(2)').text().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '').replace(/・/g, '').replace(/.*曜|限.*/g, '');
    data.campus = null;
    data.department = '法';
    data.link = 'http://' + res.request.host + res.request.path;
    // findOrCreate on db dep_edu table
    mainData.findOrCreate({ text: data.text }, data).success(function (datas, created) {
      console.log('created: ' + created);
    }).error(function (err) {
      console.log('error: ' + err);
    });
  });
});

// science
request({
  url: 'http://www.sci.kyushu-u.ac.jp/home/cancel/cancel.php',
  encoding: null
}, function(err, res, body) {
  if (err || res.statusCode !== 200) {
    console.log('error on law: ' + err.stack);
    return;
  }
  // fix encoding
  var $ = cheerio.load(new require('iconv').Iconv('Shift_JIS', 'UTF-8//TRANSLIT//IGNORE').convert(body).toString());
  // make data object
  var list = $('table table table td.j12 table[width="100%"] tr');
  var datas = '';
  list.each(function () {
    datas += $(this).find('td').text();
  });
  datas = datas.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
  }, '').replace(/(^\s+)|(\s+$)/g, '').replace(/\(/g, '（').replace(/\)/g, '）').replace(/　/g, ' ').replace(/:/g, '：').split('[[ ');
  // i=1 for datas[0] = enpty
  for (var i = 1; i < datas.length; i++) {
    var data = {};
    data.text = datas[i];
    data.tmp = data.text.match(/(\S*) ]]\s*(\d*)月\s*(\d*)日.*（(.)）\s*(\d*)時限\s*学科：(\S*)\s*学年：(\S*)\s*科目：(.*)\n\s*（担当：(.*)）/);
    data.about = data.tmp[1];
    data.date = new Date(new Date().getFullYear(), parseInt(data.tmp[2]) - 1, parseInt(data.tmp[3]), 9, 0);
    // check Day for next year
    if (['日','月','火','水','木','金','土'][data.date.getDay()] !== data.tmp[4]) {
      data.date = new Date(new Date().getFullYear() + 1, parseInt(data.tmp[2]) - 1, parseInt(data.tmp[3]), 9, 0);
    }
    //if (data.date < new Date()) { return; }
    data.period = data.tmp[5];
    data.course = data.tmp[6];
    data.grade = data.tmp[7].replace('学年', '');
    data.subject = data.tmp[8];
    data.teacher = data.tmp[9].replace(/\s/g, '');
    delete data.tmp;
    data.department = '理';
    data.link = 'http://www.sci.kyushu-u.ac.jp/index.php?type=0&sel1=11&sel2=0';
    // findOrCreate on db dep_edu table
    mainData.findOrCreate({ text: data.text }, data).success(function (datas, created) {
      console.log('created: ' + created);
    }).error(function (err) {
      console.log('error: ' + err);
    });
  }
});
