var CronJob = require('cron').CronJob;
var BBPromise = require('bluebird');

var getConnection = require('./db');
var tasks = {
  task: require('./tasks/task'),
  twit_new: require('./tasks/twit_new'),
  twit_tomorrow: require('./tasks/twit_tomorrow'),
  delete: require('./tasks/delete')
};

// run task.js 0, 4, 8, 12, 16, 20
new CronJob('0 5 0,4,8,12,16,20 * * *', function () {
  task('task');
}, null, true, 'Asia/Tokyo');
// run twit_new.js 1, 5, 9, 13, 17, 21
new CronJob('0 0,5,10 1,5,9,13,17,21 * * *', function () {
  task('twit_new');
}, null, true, 'Asia/Tokyo');
// run twit_tomorrow.js 22
new CronJob('0 0,5,10 22 * * *', function () {
  task('twit_tomorrow');
}, null, true, 'Asia/Tokyo');
// run delete.js 2
new CronJob('0 5 2 * * *', function () {
  task('delete');
}, null, true, 'Asia/Tokyo');

function task(name) {
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
    return BBPromise.using(getConnection(), function (db) {
      return BBPromise.resolve(db.model('Tasklog').findOneAndUpdate({
        name: tasklog.name
      }, tasklog).exec());
    });
  }).then(function (tasklog) {
    return 'msg: ' + tasklog.name + ' done';
  }).catch(function (err) {
    return 'err: ' + err.stack;
  }).then(function (msg) {
    console.log(msg);
  });
}
