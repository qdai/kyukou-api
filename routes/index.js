var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var async = require('async');
var config = require('../secret/config');

// connect to db
var sequelize = new Sequelize(config.db_database, config.db_user, config.db_password, {
  host: config.db_host,
  port: config.db_port
});

// defione main_data
var Events = sequelize.define('events', {
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
  tweet: Sequelize.BOOLEAN
});

/* GET home page. */
router.get('/', function(req, res) {
  async.waterfall([
    function (callback) {
      Events.findAll().success(function (events) {
        for (var i = 0; i < events.length; i++) {
          events[i].datetime = events[i].date.toISOString();
          events[i].date.setHours(events[i].date.getHours() - new Date().getTimezoneOffset() / 60);
          events[i].dateformatted = events[i].date.getFullYear() + '年' + (events[i].date.getMonth() + 1) + '月' + events[i].date.getDate() + '日（' + ['日','月','火','水','木','金','土'][events[i].date.getDay()] + ')';
          events[i].date.setHours(events[i].date.getHours() + new Date().getTimezoneOffset() / 60);
          events[i].department = events[i].department + '学部';
          if (events[i].grade) {
            events[i].grade = parseInt(events[i].grade) ? parseInt(events[i].grade) + '年' : events[i].grade;
          }
          events[i].subject = events[i].subject + (events[i].campus ? '（' + events[i].campus + '地区開講）' : '');
          //events[i].teacher = events[i].teacher ? '（' + events[i].teacher + '教員）' : null;
        }
        callback(null, events);
      }).error(function (err) {
        callback(err, null);
      });
    }
  ],function (err, events) {
    if (err) {
      res.render('index', { title: JSON.stringify(err) });
      return;
    }
    events.sort(function (a, b) {
      var diff = a.date.getTime() - b.date.getTime();
      if (diff > 0) return 1;
      if (diff < 0) return -1;
      diff = parseInt(a.period) - parseInt(b.period);
      if (diff > 0) return 1;
      if (diff < 0) return -1;
      return 0;
    });
    var columns = {
      about: [],
      period: [],
      department: []
    };
    for (var i = 0; i < events.length; i++) {
      if (columns.about.indexOf(events[i].about) === -1) {
        columns.about.push(events[i].about);
      }
      /*if (columns.period.indexOf(events[i].period) === -1) {
        columns.period.push(events[i].period);
      }*/
      if (columns.department.indexOf(events[i].department) === -1) {
        columns.department.push(events[i].department);
      }
    }
    columns.about.sort();
    //columns.period.sort();
    columns.department.sort();
    res.render('index', {
      name: config.site.name,
      title: config.site.name,
      author: config.package.author,
      columns: columns,
      events: events,
      version: 'v' + config.package.version
    });
  });
});

module.exports = router;
