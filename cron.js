var CronJob = require('cron').CronJob;
var Bluebird = require('bluebird');

var getConnection = require('./db');
var tasks = {
  task: require('./tasks/task'),
  twit_new: require('./tasks/twit_new'),
  twit_tomorrow: require('./tasks/twit_tomorrow'),
  delete: require('./tasks/delete')
};
var runTask = function (name) {
  var time = new Date();
  var hrtime = process.hrtime();
  tasks[name]().catch(function (err) {
    return 'err: ' + err.stack;
  }).then(function (msg) {
    var diff = process.hrtime(hrtime);
    var tasklog = {
      name: name,
      log: msg,
      level: 1,
      time: time,
      elapsedTime: diff[0] * 1e3 + diff[1] * 1e-6
    };
    if (/err: /.test(tasklog.log)) {
      tasklog.level = 4;
    } else if (/wrn: /.test(tasklog.log)) {
      tasklog.level = 3;
    } else if (/inf: /.test(tasklog.log)) {
      tasklog.level = 2;
    }
    return Bluebird.using(getConnection(), function (db) {
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
var jobTask = new CronJob('0 5 0,4,8,12,16,20 * * *', function () {
  runTask('task');
}, null, true, 'Asia/Tokyo');
console.log('Job task running:', jobTask.running);

// run twit_new.js 1, 5, 9, 13, 17, 21
var jobTwitNew = new CronJob('0 0,5,10 1,5,9,13,17,21 * * *', function () {
  runTask('twit_new');
}, null, true, 'Asia/Tokyo');
console.log('Job twit_new running:', jobTwitNew.running);

// run twit_tomorrow.js 22
var jobTwitTomorrow = new CronJob('0 0,5,10 22 * * *', function () {
  runTask('twit_tomorrow');
}, null, true, 'Asia/Tokyo');
console.log('Job twit_tomorrow running:', jobTwitTomorrow.running);

// run delete.js 2
var jobDelete = new CronJob('0 5 2 * * *', function () {
  runTask('delete');
}, null, true, 'Asia/Tokyo');
console.log('Job delete running:', jobDelete.running);
