'use strict';

const mongoose = require('mongoose');

const mTaskLog = mongoose.model('Tasklog');
const taskList = require('../../tasks');
const saveTaskResult = function (name, task) {
  const time = new Date();
  const hrtime = process.hrtime();
  return task.catch(function (err) {
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
    return Promise.resolve(mTaskLog.findOneAndUpdate({
      name: tasklog.name
    }, tasklog, {
      new: true
    }).exec());
  });
};

const tasks = {
  task () {
    return saveTaskResult('task', taskList.task());
  },
  twitNew (config) {
    return saveTaskResult('twit_new', taskList.twit_new(config));
  },
  twitTomorrow (config) {
    return saveTaskResult('twit_tomorrow', taskList.twit_tomorrow(config));
  },
  delete () {
    return saveTaskResult('delete', taskList.delete());
  }
};

module.exports = tasks;
