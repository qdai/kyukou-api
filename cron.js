'use strict';

const CronJob = require('cron').CronJob;
const Bluebird = require('bluebird');

const dbConnection = require('./db');
const tasks = {
  task: require('./tasks/task'),
  twit_new: require('./tasks/twit_new'), // eslint-disable-line camelcase
  twit_tomorrow: require('./tasks/twit_tomorrow'), // eslint-disable-line camelcase
  delete: require('./tasks/delete')
};
const runTask = function (name) {
  const time = new Date();
  const hrtime = process.hrtime();
  tasks[name]().catch(function (err) {
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
  }).then(function (tasklog) {
    return 'msg: ' + tasklog.name + ' done';
  }).catch(function (err) {
    return 'err: ' + err.stack;
  }).then(function (msg) {
    console.log(msg);
  });
};

// run task.js 0, 4, 8, 12, 16, 20
const jobTask = new CronJob('0 5 0,4,8,12,16,20 * * *', function () {
  runTask('task');
}, null, true, 'Asia/Tokyo');
console.log('Job task running:', jobTask.running);

// run twit_new.js 1, 5, 9, 13, 17, 21
const jobTwitNew = new CronJob('0 0,5,10 1,5,9,13,17,21 * * *', function () {
  runTask('twit_new');
}, null, true, 'Asia/Tokyo');
console.log('Job twit_new running:', jobTwitNew.running);

// run twit_tomorrow.js 22
const jobTwitTomorrow = new CronJob('0 0,5,10 22 * * *', function () {
  runTask('twit_tomorrow');
}, null, true, 'Asia/Tokyo');
console.log('Job twit_tomorrow running:', jobTwitTomorrow.running);

// run delete.js 2
const jobDelete = new CronJob('0 5 2 * * *', function () {
  runTask('delete');
}, null, true, 'Asia/Tokyo');
console.log('Job delete running:', jobDelete.running);
