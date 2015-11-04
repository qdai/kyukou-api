'use strict';

const mongoose = require('mongoose');

mongoose.Promise = Promise;

const mTaskLog = mongoose.model('Tasklog');
const runTask = (name, arg) => {
  const time = new Date();
  const hrtime = process.hrtime();
  return require('../tasks/' + name)(arg).catch(err => {
    return 'err: ' + err.stack;
  }).then(log => {
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
    return mTaskLog.findOneAndUpdate({
      name: tasklog.name
    }, tasklog, {
      new: true
    }).lean().exec().then(result => {
      delete result._id; // eslint-disable-line no-underscore-dangle
      delete result.__v; // eslint-disable-line no-underscore-dangle
      return result;
    });
  });
};

const ApiTasks = class {
  constructor (config) {
    this.config = config;
  }
  task () {
    return runTask('task');
  }
  twitNew () {
    return runTask('twit_new', this.config);
  }
  twitTomorrow () {
    return runTask('twit_tomorrow', this.config);
  }
  delete () {
    return runTask('delete');
  }
};

module.exports = ApiTasks;
