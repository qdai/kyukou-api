var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var mongoose = require('mongoose');
var Tasklog = mongoose.model('Tasklog');

// run task.js 0, 4, 8, 12, 16, 20
new CronJob('0 5 0,4,8,12,16,20 * * *', function () {
  task('task', './tasks/task.js');
}, null, true, 'Asia/Tokyo');
// run twit_new.js 1, 5, 9, 13, 17, 21
new CronJob('0 0,5,10 1,5,9,13,17,21 * * *', function () {
  task('twit_new', './tasks/twit_new.js');
}, null, true, 'Asia/Tokyo');
// run twit_tomorrow.js 22
new CronJob('0 0,5,10 22 * * *', function () {
  task('twit_tomorrow', './tasks/twit_tomorrow.js');
}, null, true, 'Asia/Tokyo');
// run delete.js 2
new CronJob('0 5 2 * * *', function () {
  task('delete', './tasks/delete.js');
}, null, true, 'Asia/Tokyo');

function task(name, file) {
  var time = new Date();
  var hrtime = process.hrtime();
  exec(file, function (error, stdout, stderr) {
    var diff = process.hrtime(hrtime);
    var tasklog = {
      name: name,
      log: stdout,
      level: 1,
      time: time,
      elapsedTime: diff[0] * 1e3 + diff[1] * 1e-6
    };
    if (stderr) {
      tasklog.log = 'err: stderr.\nmsg: ' + stderr;
    }
    if (error) {
      tasklog.log = 'err: exec error.\nmsg: ' + error.message;
    }
    if (/err: /.test(tasklog.log)) {
      tasklog.level = 4;
      if (/err: findorcreate failed/.test(tasklog.log) && /msg: ValidationError: Validator failed for path `eventDate`/.test(tasklog.log)
          && tasklog.log.match(/err: /g).length === tasklog.log.match(/err: findorcreate failed/g).length
          && tasklog.log.match(/err: findorcreate failed/g).length === tasklog.log.match(/msg: ValidationError: Validator failed for path `eventDate`/g).length) {
        tasklog.level = 2;
        if (/wrn: /.test(tasklog.log)) {
          tasklog.level = 3;
        }
      }
    } else if (/wrn: /.test(tasklog.log)) {
      tasklog.level = 3;
    }
    Tasklog.findOneAndUpdate({
      name: tasklog.name
    }, tasklog, function (err, tasklog) {
      if (err) {
        console.log('db save err: ' + err);
      }
      console.log('msg: ' + tasklog.name + ' done');
    });
  });
}
