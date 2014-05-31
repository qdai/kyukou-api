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

var dateNow = new Date();

// tweet tomorrow event
Events.findAll({
  where: {
    date: new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1, - (new Date().getTimezoneOffset() / 60)) // dateTomorrow
  }
}).success(function (datas) {
  for (var i = 0; i < datas.length; i++) {
    var text = '【' + datas[i].about + '】明日' + (datas[i].date.getMonth() + 1) + '月' +　datas[i].date.getDate() +
               '日（' + ['日','月','火','水','木','金','土'][datas[i].date.getDay() + 1] + '）\n' +
               datas[i].department + '学部' + datas[i].period + '時限「' + datas[i].subject + '」';
    //console.log(text);
    twit.post('statuses/update', { status: text }, function(err, data, response) {
      try {
        console.log('twitter post id: ' + data['id_str']);
      } catch (err) {
        console.log('error: twitter post failed');
      }
    });
  }
}).error(function (err) {
  console.log('error on findAll: ' + err);
});
