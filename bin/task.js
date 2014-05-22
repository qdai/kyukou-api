#!/usr/bin/env node

var request = require('request');
var cheerio = require('cheerio');
var Sequelize = require("sequelize");
var Twit = require('twit');
var config = require('../secret/config');

// connect to db
var sequelize = new Sequelize(config.db_database, config.db_user, config.db_password, {
  host: config.db_host
});
// define department_education
var dep_edu = sequelize.define('department_education', {
  pubdate: Sequelize.DATE,
  date: Sequelize.DATE,
  text: Sequelize.STRING,
  link: Sequelize.STRING,
  department: Sequelize.STRING,
});

// education
var url = 'http://education.kyushu-u.ac.jp/topics/student_index';
request({ url: url }, function(err, res, body) {
  // get data
  if (err || res.statusCode !== 200) {
    console.log('error on education: ' + err.stack);
    callback(null, err);
    return;
  }
  var $ = cheerio.load(body);
  // make data object
  var list = $('#news dd');
  list.each(function () {
    var data = {};
    // format data
    data.department = 'education';
    data.pubdate = $(this).find('.date').text().replace(/\//g, '-');
    data.text = $(this).find('.text').text().replace(/(^\s+)|(\s+$)/g, '').replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }, '');
    data.link = 'http://' + res.request.host + ($(this).find('a').attr('href') || res.request.path);
    // findOrCreate on db dep_edu table
    dep_edu.findOrCreate({ text: data.text }, data).success(function (depedu, created) {
      console.log('created: ' + created);
    }).error(function (err) {
      console.log('error: ' + err);
    });
  });
});

// twit
var twit = new Twit({
  consumer_key: config.tw_consumer_key,
  consumer_secret: config.tw_consumer_secret,
  access_token: config.tw_access_token,
  access_token_secret: config.tw_access_token_secret
});


