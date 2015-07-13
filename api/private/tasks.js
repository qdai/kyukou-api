'use strict';

const Bluebird = require('bluebird');

const dbConnection = require('../../db');
const taskList = require('../../tasks');
const runTask = function (name) {
  const time = new Date();
  const hrtime = process.hrtime();
  return taskList[name]().catch(function (err) {
    return 'err: ' + err.stack;
  }).then(function (log) {
    const diff = process.hrtime(hrtime);
    const tasklog = {
      name,
      log,
      level: 1,
      time,
      elapsedTime: diff[0] * 1e3 + diff[1] * 1e-6
    };
    if (/err: /.test(tasklog.log)) {
      tasklog.level = 4;
    } else if (/wrn: /.test(tasklog.log)) {
      tasklog.level = 3;
    } else if (/inf: /.test(tasklog.log)) {
      tasklog.level = 2;
    }
    return Bluebird.using(dbConnection(), function (db) {
      return db.model('Tasklog').findOneAndUpdate({
        name: tasklog.name
      }, tasklog, {
        new: true
      }).exec();
    });
  });
};

const tasks = {
  task () {
    return runTask('task');
  },
  twitNew () {
    return runTask('twit_new');
  },
  twitTomorrow () {
    return runTask('twit_tomorrow');
  },
  delete () {
    return runTask('delete');
  }
};

module.exports = tasks;
