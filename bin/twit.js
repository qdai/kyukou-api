#!/usr/bin/env node

// call if (hour % 4) == 2

var Twit = require('twit');
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

// twit
var twit = new Twit({
  consumer_key: config.tw_consumer_key,
  consumer_secret: config.tw_consumer_secret,
  access_token: config.tw_access_token,
  access_token_secret: config.tw_access_token_secret
});


var dateNow = new Date();
//if (dateNow.getHours() !== 22) {
// tweet new event
  
//} else {
// tweet tomorrow event
  mainData.findAll({ where: { date: new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1) } }).success(function (datas) {

    for (var i = 0; i < datas.length; i++) {
      var text = '！！！てすと！！！\n【' + datas[i].about + '】明日' + dateNow.getMonth() + '月' +　(dateNow.getDate() + 1) +
                 '日（' + ['日','月','火','水','木','金','土'][dateNow.getDay() + 1] + '）\n' +
                 datas[i].department + '学部' + datas[i].period + '時限「' + datas[i].subject + '」';
      //console.log(text);
      twit.post('statuses/update', { status: text }, function(err, data, response) {
        console.log('twitter post id: ' + data['id_str']);
      });
    }
  }).error(function (err) {
    console.log('error on findAll: ' + err);
  });
//}
