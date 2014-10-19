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
  var time = process.hrtime();
  exec(file, function (error, stdout, stderr) {
    if (error) {
      return console.log('exec error: ' + error);
    }
    if (stderr) {
      return console.log('stderr: ' + stderr);
    }
    var diff = process.hrtime(time);
    var tasklog = {
      name: name,
      log: stdout,
      time: new Date(),
      elapsedTime: diff[0] * 1e3 + diff[1] * 1e-6
    };
    Tasklog.findOneAndUpdate({
      name: tasklog.name
    }, tasklog, function (err, tasklog) {
      if (err) {
        console.log('db save err: ' + err);
      }
      console.log('task: done');
    });
  });
}
