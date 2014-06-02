#!/usr/bin/env node

var Twit = require('twit');
var Sequelize = require('sequelize');
var config = require('../secret/config');

// connect to db
var sequelize = new Sequelize(config.db_database, config.db_user, config.db_password, {
  host: config.db_host,
  port: config.db_port,
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

var twit = new Twit({
  consumer_key: config.tw_consumer_key,
  consumer_secret: config.tw_consumer_secret,
  access_token: config.tw_access_token,
  access_token_secret: config.tw_access_token_secret
});

// tweet new event
Events.findAndCountAll({
  where: {
    tweet: false
  },
  limit: 16
}).success(function (events) {
  for (var i = 0; i < events.rows.length; i++) {
    events.rows[i].date.setHours(events.rows[i].date.getHours() - new Date().getTimezoneOffset() / 60);
    var text = '新規：【' + events.rows[i].about + '】' + (events.rows[i].date.getMonth() + 1) + '月' + events.rows[i].date.getDate() +
               '日（' + ['日','月','火','水','木','金','土'][events.rows[i].date.getDay()] + '）\n' +
               events.rows[i].department + '学部' + events.rows[i].period + '時限「' + events.rows[i].subject + '」';
    twit.post('statuses/update', { status: text }, function(err, data, response) {
      if (err) {
        console.log('error: twitter post');
        console.log('message: ' + err);
        break;
      }
      try {
        console.log('twitter post id: ' + data['id_str']);
      } catch (err) {
        console.log('error: parse twitter returns');
        console.log('data: ' + data);
      }
    });
    events.rows[i].updateAttributes({
      tweet: true
    }).success(function() {
      console.log('message: database update success');
    });
  }
  console.log('message: tweeted(' + events.rows.length + '/' + events.count + ')');
}).error(function (err) {
  console.log('error: find not tweeted event');
  console.log('message: ' + err);
});
