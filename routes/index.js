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
          events[i].grade = events[i].grade ? events[i].grade + '年' : null;
          events[i].subject = '「' + events[i].subject + (events[i].campus ? '（' + events[i].campus + '地区開講）' : '') + '」';
          events[i].teacher = events[i].teacher ? '（' + events[i].teacher + '教員）' : null;
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
    res.render('index', {
      title: config.site.name,
      author: config.site.author,
      events: events
    });
  });
});

module.exports = router;
