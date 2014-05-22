#!/usr/bin/env node

var Sequelize = require("sequelize")
var config = require('../secret/config');

// connect to db
var sequelize = new Sequelize(config.db_database, config.db_user, config.db_password, {
  host: config.db_host
});

// create  table
var departments = [
  'education',
];
// each department
for (var i = 0; i < departments.length; i++) {
  sequelize.define('department_' + departments[i], {
    pubdate: Sequelize.DATE,
    date: Sequelize.DATE,
    text: Sequelize.STRING,
    link: Sequelize.STRING,
    //period: Sequelize.INTEGER,
    department: Sequelize.STRING,
    //course: Sequelize.STRING,
    //grade: Sequelize.INTEGER,
    //subject: Sequelize.STRING,
    //teacher: Sequelize.STRING,
    //campus: Sequelize.STRING,
    //room: Sequelize.STRING,
    //note: Sequelize.TEXT
  });
}

// sync
sequelize.sync().success(function() {
  console.log('create db table: success');
}).error(function(error) {
  console.log('error on create table: ' + error);
});
