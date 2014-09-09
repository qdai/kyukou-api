var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var async = require('async');
var config = require('../secret/config');
var RSS = require('rss');

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
          //events[i].date.setHours(events[i].date.getHours() + new Date().getTimezoneOffset() / 60);
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
    var feed = new RSS({
      title: config.site.name,
      description: config.site.description,
      genarator: config.package.name,
      feed_url: config.site.url + '/rss',
      site_url: config.site.url,
      language: config.site.lang,
      ttl: 180
    });
    events.sort(function (a, b) {
      var diff = a.date.getTime() - b.date.getTime();
      if (diff > 0) return 1;
      if (diff < 0) return -1;
      diff = parseInt(a.period) - parseInt(b.period);
      if (diff > 0) return 1;
      if (diff < 0) return -1;
      return 0;
    });
    for (var i = 0; i < 20; i++) {
      console.log(events[i]);
      feed.item({
        title: events[i].dateformatted + '【' + events[i].about + '】' + events[i].subject,
        description: '【' + events[i].about + '】' + events[i].dateformatted + events[i].period + '\n'
          + events[i].department + events[i].period + '「' + events[i].subject + '」（' + events[i].teacher + '教員）',
        url: events[i].link,
        guid: events[i].id + '-' + events[i].date.getTime() + '-' + events[i].period + '-' + escape(events[i].subject),
        date: events[i].date.toISOString()
      });
    }
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml('  '));
  });
});

module.exports = router;
