#!/usr/bin/env node

var Sequelize = require("sequelize")
var config = require('../secret/config');

// connect to db
var sequelize = new Sequelize(config.db_database, config.db_user, config.db_password, {
  host: config.db_host
});

// create  table
sequelize.define('main_data', {
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

// sync
sequelize.sync().success(function() {
  console.log('create db table: success');
}).error(function(error) {
  console.log('error on create db table: ' + error);
});
